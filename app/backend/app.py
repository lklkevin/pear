from functools import wraps
import datetime
import secrets
import re
import ssl

from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from werkzeug.security import generate_password_hash, check_password_hash

import backend.database as dao
import backend.database.db_factory as db_factory

import os
from dotenv import load_dotenv
import redis
import json
from backend.task import generate_exam_task, generate_and_save_exam_task

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "https://avgr.vercel.app"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "expose_headers": ["Access-Control-Allow-Origin"],
        "supports_credentials": True,
        "max_age": 3600  # Cache preflight requests for 1 hour
    },
})

load_dotenv()

redis_url = os.environ.get("REDIS_URL")
pattern = r"rediss://default:(?P<A>[^@]+)@(?P<B>[^:]+):(?P<C>[^/]+)/"
match = re.search(pattern, redis_url)

redis_host = match.group("B")
redis_port = match.group("C")
redis_password = match.group("A")

if os.environ.get("FLASK_ENV", "production") == "development":
    ssl_cert_reqs = ssl.CERT_NONE
else:
    ssl_cert_reqs = ssl.CERT_REQUIRED

redis_client = redis.Redis(
    host=redis_host,
    port=redis_port,
    password=redis_password,
    ssl=True,
    ssl_cert_reqs=ssl_cert_reqs
)

# JWT configuration
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(days=7)
db = db_factory.get_db_instance()

# Token generation functions
def generate_access_token(user_id):
    """
    Generate a short-lived JWT access token for a given user.

    The token includes the user ID, issued-at time, expiration time, and a type field.
    It is signed using the HS256 algorithm and a secret key from the environment.

    Args:
        user_id: The ID of the user for whom the token is generated.

    Returns:
        A JWT access token as a string.
    """
    return jwt.encode({
        'user_id': user_id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'iat': datetime.datetime.now(datetime.timezone.utc),
        'type': 'access'
    }, os.environ.get("SECRET_KEY"), algorithm="HS256")


def generate_refresh_token(user_id: int) -> str:
    """
    Generate a long-lived refresh token for a given user and store it in the database.

    This function creates a secure hex token, sets its expiration time, and attempts
    to persist it to the database. If storing fails, the error is printed but the token is still returned.

    Args:
        user_id: The ID of the user for whom the refresh token is generated.

    Returns:
        A secure 128-character hex refresh token as a string.
    """
    token_value = secrets.token_hex(64)
    
    # Set expiration
    expires_at = datetime.datetime.now(datetime.timezone.utc) + app.config['JWT_REFRESH_TOKEN_EXPIRES']

    try:
        db.create_refresh_token(user_id, token_value, expires_at)
    except (dao.DatabaseError, dao.DataError) as e:
        # XXX: right now there is no explicit handling of a db error when
        #      creating a token, so we might end up with a situation where
        #      a refresh token but was not stored
        print(e)
    return token_value


# Token verification decorator
def token_required(f):
    """
        Decorator to enforce JWT access token authentication on protected routes.

        - Extracts the token from the Authorization header (Bearer scheme).
        - Verifies the token's signature and expiration.
        - Ensures the token is of type "access".
        - Fetches the corresponding user from the database and passes it to the route handler.

        Returns:
            A decorated function that rejects unauthorized requests with appropriate error messages,
            or calls the wrapped route handler with the current user as the first argument.
        """
    @wraps(f)
    def decorated(*args, **kwargs):
        # Skip token validation for OPTIONS requests (CORS preflight)
        if request.method == 'OPTIONS':
            response = jsonify({'status': 'success'})
            return response
            
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Access token is missing!'}), 401
        
        try:
            # Verify and decode token
            data = jwt.decode(token, os.environ.get("SECRET_KEY"), algorithms=["HS256"])
            
            # Verify it's an access token
            if data.get('type') != 'access':
                return jsonify({'message': 'Invalid token type!'}), 401
                
            # Get the user
            current_user = db.get_user(user_id=data['user_id'])
            
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!', 'code': 'token_expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
        except dao.DatabaseError:
            return jsonify({'message': 'Error retrieving user information!'})
            
        return f(current_user, *args, **kwargs)
    
    return decorated


# Routes
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """
    Registers a new user with a username, email, and password.

    Validates input and ensures the user doesn't already exist.
    Hashes the password and stores the user in the database.
    Returns access and refresh tokens on success.

    Returns:
        JSON response with user details and tokens, or error message with appropriate status code.
    """

    data = request.get_json()
    
    # Validate required fields: username, email, and password are now all required
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Username, email, and password are required!'}), 400
    
    # Check if user already exists
    if db.user_exists(email=data['email']):
        return jsonify({'message': 'User already exists!'}), 409
    
    if db.user_exists(email=data['username']):
        return jsonify({'message': 'User already exists!'}), 409
    
    # Generate hashed password
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')

    try:
        auth_provider = 'local'
        new_id = db.add_user(data['username'], data['email'], hashed_password, auth_provider)
    except dao.DataError:
        return jsonify({'message': 'Username or email already in use!'}), 409   
    
    # Generate tokens
    access_token = generate_access_token(new_id)
    refresh_token = generate_refresh_token(new_id)
    
    return jsonify({
        'id': new_id,
        'email': data['email'],
        'username': data['username'],
        'auth_provider': auth_provider,
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Authenticates a user using email and password.

    Checks credentials against the database, updates the user's last login,
    and returns a new access and refresh token pair.

    Returns:
        JSON response with user details and tokens, or error message if authentication fails.
    """
    data = request.get_json()
    
    # Find the user
    user = db.get_user(email=data['email'])
    
    if not user:
        return jsonify({'message': 'Invalid credentials!'}), 401

    # unpack user
    user_id, username, email, password, auth_provider, oauth_id, created_at, updated_at, last_login = user
    
    if auth_provider != 'local':
        return jsonify({'message': 'Invalid credentials!'}), 401
    
    # Verify password
    if not check_password_hash(password, data['password']):
        return jsonify({'message': 'Invalid credentials!'}), 401
    
    # Update last login time
    db.set_last_login(username, datetime.datetime.now(datetime.timezone.utc))
    
    # Generate tokens
    access_token = generate_access_token(user_id)
    refresh_token = generate_refresh_token(user_id)
    
    return jsonify({
        'id': user_id,
        'email': email,
        'username': username,
        'auth_provider': auth_provider,
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    """
    Handles user login or registration via Google OAuth.

    If the user exists, it updates the OAuth ID if missing.
    If the user doesn't exist, it creates a new one using the email and OAuth ID.
    Generates access and refresh tokens on success.

    Returns:
        JSON response with user details and tokens, or error message on failure.
    """
    data = request.get_json()
    
    # Validate required fields for Google authentication
    if not data.get('email') or not data.get('oauth_id'):
        return jsonify({'message': 'Email and OAuth ID are required!'}), 400
    
    # Check if a user already exists with this email
    user = db.get_user(email=data['email'])
    
    if user:
        # If user exists and is a local account, only update oauth_id if it's missing
        user_id, username, auth_provider, oauth_id = user[0], user[1], user[4], user[5]
        if auth_provider == 'local' and not oauth_id:
            # Keep auth_provider as 'local' as requested
            db.set_oauth_id(user_id, data['oauth_id'])
        
        # Update last login time
        db.set_last_login(username, datetime.datetime.now(datetime.timezone.utc))
    else:
        # For Google users, if a username is not provided, generate one based on the email.
        email_prefix = data['email'].split('@')[0]
        username = f"{email_prefix}_{secrets.token_hex(4)}"
        auth_provider = 'google'
        
        try:
            # password is None here as no password is required when signing in
            # using Google as the auth provider
            user_id = db.add_user(username, data['email'], None, 'google', data['oauth_id'])

            db.set_last_login(username, datetime.datetime.now(datetime.timezone.utc))
        except dao.DataError:
            return jsonify({'message': 'Error creating user!'}), 500
    
    # Generate tokens
    access_token = generate_access_token(user_id)
    refresh_token = generate_refresh_token(user_id)
    
    return jsonify({
        'id': user_id,
        'email': data['email'],
        'username': username,
        'auth_provider': auth_provider,
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


@app.route('/api/auth/refresh', methods=['POST'])
def refresh():
    """
    Rotates JWT tokens using a valid, non-expired refresh token.

    Validates the refresh token and issues a new access and refresh token.
    Revokes the old refresh token if it is expired.

    Returns:
        JSON response with new tokens, or error message if token is invalid or expired.
    """
    data = request.get_json()
    
    if not data.get('refresh_token'):
        return jsonify({'message': 'Refresh token is required!'}), 400
    
    # Find the refresh token in the database
    token_record = db.get_refresh_token(data['refresh_token'], False)
    
    if not token_record:
        return jsonify({'message': 'Invalid refresh token!'}), 401

    user_id, expires_at, created_at = token_record
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=datetime.timezone.utc)
    
    # Check if token is expired
    if expires_at < datetime.datetime.now(datetime.timezone.utc):
        db.set_revoked_status(data['refresh_token'], True)
        return jsonify({'message': 'Refresh token has expired!'}), 401
    
    # Get user
    user = db.get_user(user_id=user_id)
    
    if not user:
        return jsonify({'message': 'User not found!'}), 401
    
    # Generate new access token
    access_token = generate_access_token(user_id)
    
    # Token rotation: generate new refresh token
    new_refresh_token = generate_refresh_token(user_id)
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': new_refresh_token
    }), 200


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """
    Logs out the user by revoking the provided refresh token.

    Marks the refresh token as revoked in the database to prevent future use.

    Returns:
        JSON response confirming logout or error message if token is invalid.
    """
    data = request.get_json()
    
    if not data.get('refresh_token'):
        return jsonify({'message': 'Refresh token is required!'}), 400
    
    # Revoke the refresh token
    token_record = db.get_refresh_token(data['refresh_token'], False)
    # token_record = RefreshToken.query.filter_by(token=data['refresh_token']).first()
    
    if token_record:
        db.set_revoked_status(data['refresh_token'], True)
    else:
        return jsonify({'message': 'Invalid refresh token!'}), 400

    
    return jsonify({'message': 'Successfully logged out!'}), 200


# Protected route example
@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """
    Get the authenticated user's profile information.

    Returns:
        JSON response containing the user's ID, email, username, and auth provider.
    """
    return jsonify({
        'id': current_user[0],
        'email': current_user[2],
        'username': current_user[1],
        'auth_provider': current_user[4]
    }), 200


@app.route('/api/user/username', methods=['PATCH'])
@token_required
def update_username(current_user):
    """
    Update the authenticated user's username.

    Expects:
        JSON body with a new 'username' value.

    Returns:
        JSON message confirming update or an error message.
    """
    user_id = current_user[0]
    data = request.get_json()
    new_username = data.get('username')

    if not new_username:
        return jsonify({'message': 'New username is required.'}), 400

    try:
        db.update_username(user_id, new_username)
        return jsonify({
            'message': 'Username updated successfully.',
            'username': new_username
        }), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/user/password', methods=['PATCH'])
@token_required
def update_password(current_user):
    """
    Update the user's password after verifying the old one.

    Expects:
        JSON body with 'oldPassword' and new 'password'.

    Returns:
        JSON message confirming success or explaining the failure.
    """
    user_id = current_user[0]
    data = request.get_json()
    old_password = data.get('oldPassword')
    new_password = data.get('password')

    if not old_password or not new_password:
        return jsonify({'message': 'Old and new password are required.'}), 400

    try:
        user = db.get_user(user_id=user_id)
        if not user:
            return jsonify({'message': 'User not found.'}), 404

        stored_password = user[3]  # Assuming password is at index 3

        if not check_password_hash(stored_password, old_password):
            return jsonify({'message': 'Old password is incorrect.'}), 401

        hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')
        db.update_password(user_id, hashed_password)

        return jsonify({'message': 'Password updated successfully!'}), 200

    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/user/account', methods=['DELETE'])
@token_required
def delete_account(current_user):
    """
    Deletes the authenticated user's account from the database.

    Returns:
        JSON response confirming deletion or detailing an error.
    """
    user_id = current_user[0]

    try:
        db.delete_user_account(user_id)
        return jsonify({'message': 'Account deleted successfully.'}), 200
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/exam/generate', methods=['POST', 'OPTIONS'])
def generate_exam():
    """
    Generate an exam based on uploaded PDF(s) without saving it.

    Expects:
        Multipart form-data including:
            - 'files': list of PDFs
            - 'title': title of the exam
            - 'description': short description
            - 'num_questions': number of questions to generate

    Returns:
        Task ID for checking the async generation status.
    """
    # Handle preflight CORS requests
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'success'})
        # (Add your CORS headers here as needed)
        return response

    max_questions = 10

    if 'files' not in request.files:
        return jsonify({'message': 'No files provided!'}), 400

    files = request.files.getlist('files')
    title = request.form.get('title')
    description = request.form.get('description')
    num_questions = request.form.get('num_questions')

    if not title or not description:
        return jsonify({'message': 'Title and description are required!'}), 400

    try:
        num_questions = int(num_questions)
    except (TypeError, ValueError):
        return jsonify({'message': 'Invalid number of questions'}), 400

    if num_questions > max_questions:
        return jsonify({'message': f"Too many questions for guest user (max {max_questions})."}), 400
    elif num_questions <= 0:
        return jsonify({'message': 'Cannot generate fewer than 1 question.'}), 400

    try:
        # Read all PDF file data
        pdf_data_list = [file.stream.read() for file in files]
    except Exception as e:
        return jsonify({'message': f'Error reading files: {str(e)}'}), 500

    # Enqueue the exam generation task using Celery
    task = generate_exam_task.delay(pdf_data_list, num_questions, title, description)
    return jsonify({'task_id': task.id}), 202


@app.route('/api/task/<task_id>', methods=['GET'])
def get_task_status(task_id):
    """
    Check the status of an asynchronous exam generation task.

    Args:
        task_id: ID of the Celery task

    Returns:
        JSON response with task state and result or error.
    """
    from backend.task import celery  # Import the Celery instance
    task = celery.AsyncResult(task_id)
    if task.state == 'PENDING':
        response = {'state': task.state, 'result': 'Pending...'}
    elif task.state != 'FAILURE':
        response = {'state': task.state, 'result': task.result}
    else:
        try:
            json.dumps(task.result)
            status = task.result
        except TypeError:
            status = str(task.result)
        response = {'state': task.state, 'result': status}
    return jsonify(response)


@app.route('/api/exam/generate/save', methods=['POST', 'OPTIONS'])
@token_required
def generate_and_save_exam(current_user):
    """
    Generate and save an exam for a logged-in user.

    Expects:
        Multipart form-data including:
            - 'files': list of PDFs
            - 'title', 'description', 'color', 'privacy', 'num_questions'

    Returns:
        Task ID for checking progress of generation and save.
    """
    # Handle preflight request for CORS
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'success'})
        return response
        
    max_questions = 10

    if 'files' not in request.files:
        return jsonify({'message': 'No files provided!'}), 400

    files = request.files.getlist('files')
    title = request.form.get('title')
    description = request.form.get('description')
    color = request.form.get('color')
    privacy = request.form.get('privacy')
    num_questions = request.form.get('num_questions')

    try:
        num_questions = int(num_questions)
    except (TypeError, ValueError):
        return jsonify({'message': 'Invalid number of questions'}), 400

    if num_questions > max_questions:
        return jsonify({'message': f"Too many questions for user (max {max_questions})."}), 400
    elif num_questions <= 0:
        return jsonify({'message': 'Cannot generate fewer than 1 question.'}), 400

    if not title or not description or not color or privacy is None:
        return jsonify({'message': 'Title, description, color, and privacy are required!'}), 400

    try:
        # Convert privacy to boolean
        privacy = bool(int(privacy))
    except ValueError:
        return jsonify({'message': 'Privacy must be 0 (private) or 1 (public).'}), 400

    try:
        # Read all PDF file data
        pdf_data_list = [file.stream.read() for file in files]
    except Exception as e:
        return jsonify({'message': f'Error reading files: {str(e)}'}), 500

    # Enqueue the exam generation and save task using Celery
    task = generate_and_save_exam_task.delay(
        pdf_data_list, 
        num_questions, 
        title, 
        description, 
        color, 
        privacy, 
        current_user[1]  # username
    )
    
    return jsonify({'task_id': task.id}), 202


@app.route('/api/exam/generate/save-after', methods=['POST'])
@token_required
def save_exam_after_generate(current_user):
    """
    Save a pre-generated exam to the database manually.

    Expects:
        JSON body with:
            - 'title', 'description', 'color', 'privacy'
            - 'questions': list of questions and answers

    Returns:
        JSON response with the created exam ID.
    """
    data = request.get_json()

    # Validate input fields
    required_fields = ["title", "description", "color", "privacy", "questions"]
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({'message': 'Title, description, color, privacy, and questions are required!'}), 400

    # Extract values from JSON
    title = data["title"]
    description = data["description"]
    color = data["color"]
    privacy = bool(int(data["privacy"]))  # Ensure privacy is a boolean
    questions = data["questions"]

    # Save the exam to the database
    exam_id = db.add_exam(
        username=current_user[1],  # Assuming current_user is a tuple (id, username, email, ...)
        name=title,
        color=color,
        description=description,
        public=privacy
    )

    # Insert questions into the database (insert_question already handles inserting answers)
    for index, question_data in enumerate(questions, start=1):
        question_text = question_data["question"]
        answers = question_data["answers"]  # Dictionary of answer -> confidence

        # Insert question (this will also insert answers internally)
        if answers is not None:
            db.insert_question(index, exam_id, question_text, set(answers.items()))

    return jsonify({'exam_id': exam_id}), 201


@app.route('/api/exam/<int:exam_id>', methods=['GET'])
def get_exam_endpoint(exam_id):
    """
    Get an exam by ID.

    Returns:
        JSON containing exam metadata and all questions + answers.
        Handles privacy restrictions based on login/token validation.
    """
    try:
        exam_data = db.get_exam(exam_id)
        if not exam_data:
            return jsonify({'message': 'Exam not found!'}), 404

        _, title, _, ownerId, _, desc, public, _, exam = exam_data

        if public:
            vis = "Public"
        else:
            token = None
        
            # Get token from Authorization header
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
        
            if not token:
                return jsonify({'message': 'Access token is missing!'}), 401
        
            try:
                data = jwt.decode(token, os.environ.get("SECRET_KEY"), algorithms=["HS256"])
            
                if data.get('type') != 'access':
                    return jsonify({'message': 'Invalid token type!'}), 401
                
                if (data['user_id'] != ownerId):
                    return jsonify({'message': 'You do not have permission to access this exam'}), 401

            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token has expired!', 'code': 'token_expired'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Invalid token!'}), 401
            except dao.DatabaseError:
                return jsonify({'message': 'Error retrieving user information!'})
            
            vis = "Private"

        return jsonify({
            "title": title,
            "description": desc,
            "privacy": vis,
            "questions": [
                {
                    "question": q,
                    "answers": exam.get_all_answers(q)  # Include all answers with confidence
                }
                for q in exam.get_question()
            ]
        }), 200

    except Exception as e:
        print(str(e))
        return jsonify({'message': f'Error retrieving exam: {str(e)}'}), 500


@app.route("/api/browse", methods=["GET"])
def get_exams_endpoint():
    """
    Retrieve a paginated list of public exams.

    Query Params:
        - 'sorting': popular/recent (default: popular)
        - 'title': search filter for name
        - 'limit': number per page (default: 10)
        - 'page': page number (default: 1)

    Returns:
        JSON list of public exams with metadata.
    """
    # Retrieve query parameters with default values
    sorting = request.args.get("sorting", "popular")
    title = request.args.get("title", "")
    
    try:
        limit = int(request.args.get("limit", 10))
    except ValueError:
        limit = 10

    try:
        page = int(request.args.get("page", 1))
    except ValueError:
        page = 1

    cache_key = f"exams:{sorting}:{title}:{limit}:{page}"
    cached_data = redis_client.get(cache_key)
    if cached_data:
        exams = json.loads(cached_data)
        return jsonify(exams), 200
    
    # Call getExams on the db instance.
    # Here, user_id is not supplied (None) and filter is always "N/A".
    try:
        exams = db.get_exams(None, sorting, "N/A", title, limit, page)

        results = [
            {
            "exam_id": exam[0],
            "name": exam[1],
            "date": exam[2],
            "owner": exam[3],
            "color": exam[4],
            "description": exam[5],
            "public": exam[6],
            "num_fav": exam[7],
            "liked": False
            }
            for exam in exams
        ]

        redis_client.setex(cache_key, 60, json.dumps(results))
        return jsonify(results), 200
    except Exception as e:
        print(str(e))
        return jsonify({'message': f'Error retrieving exam: {str(e)}'}), 500
    

@app.route("/api/browse/personal", methods=["GET"])
@token_required
def get_exams_personal(current_user):
    """
    Retrieve exams associated with the authenticated user.

    Query Params:
        - title (str): Filter exams by title.
        - filter (str): Type of exam list to fetch. Options: 'favourites', 'mine', or 'N/A'.
        - sorting (str): Sort order (e.g., 'recent', 'popular').
        - limit (int): Max number of exams per page (default: 10).
        - page (int): Page number to fetch (default: 1).

    Returns:
        JSON list of exams (personal or favourited), with optional caching.
    """
    title = request.args.get("title", "")
    filter = request.args.get("filter", "N/A")
    sorting = request.args.get("sorting", "recent")
    
    try:
        limit = int(request.args.get("limit", 10))
    except ValueError:
        limit = 10

    try:
        page = int(request.args.get("page", 1))
    except ValueError:
        page = 1

    if filter != "favourites":
        cache_key = f"exams:{current_user[0]}:{sorting}:{filter}:{title}:{limit}:{page}"
        cached_data = redis_client.get(cache_key)
        if cached_data:
            exams = json.loads(cached_data)
            return jsonify(exams), 200

    try:
        exams = db.get_exams(current_user[0], sorting, filter, title, limit, page)

        results = [
            {
            "exam_id": exam[0],
            "name": exam[1],
            "date": exam[2],
            "owner": exam[3],
            "color": exam[4],
            "description": exam[5],
            "public": exam[6],
            "num_fav": exam[7],
            "liked": exam[8]
            }
            for exam in exams
        ]

        if filter != "favourites":
            redis_client.setex(cache_key, 30, json.dumps(results))
        return jsonify(results), 200
    except Exception as e:
        print(str(e))
        return jsonify({'message': f'Error retrieving exam: {str(e)}'}), 500
    

@app.route("/api/favourite", methods=["POST"])
@token_required
def fav(current_user):
    """
    Mark or unmark an exam as a favourite for the authenticated user.

    Expects:
        JSON body with:
            - exam_id (int): ID of the exam to favourite or unfavourite.
            - action (str): Either 'fav' or 'unfav'.

    Returns:
        JSON response confirming the action or detailing an error.
    """
    data = request.get_json()
    exam_id = data.get("exam_id")
    action = data.get("action")
    
    if exam_id is None or action is None:
        return jsonify({"error": "Missing exam_id or action in request body"}), 400
    
    user_id = current_user[0]
    
    try:
        if action.lower() == "fav":
            db.add_favourite(user_id, exam_id)
            return jsonify({"message": "Exam favourited successfully."}), 200
        elif action.lower() == "unfav":
            db.remove_favourite(user_id, exam_id)
            return jsonify({"message": "Exam unfavourited successfully."}), 200
        else:
            return jsonify({"error": "Invalid action specified. Use 'fav' or 'unfav'."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400    
    

@app.after_request
def after_request(response):
    """
    Flask hook to log the method and path of every completed request.

    Args:
        response: The Flask response object.

    Returns:
        The unchanged response object.
    """
    app.logger.debug(f"{request.method} {request.path} - {response.status}")
    return response


if __name__ == '__main__':
    app.run(host="0.0.0.0", port="5000", debug=True)