import asyncio
from functools import wraps
import datetime
import secrets

from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from werkzeug.security import generate_password_hash, check_password_hash

import backend.database as dao
import backend.database.db_factory as db_factory
import backend.examGenerator as eg

import os
from dotenv import load_dotenv
import redis
import json
from backend.task import generate_exam_task, generate_and_save_exam_task

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "https://avgr.vercel.app"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
        "expose_headers": ["Access-Control-Allow-Origin"],
        "supports_credentials": True,
        "max_age": 3600  # Cache preflight requests for 1 hour
    },
})
load_dotenv()

redis_host = os.environ.get("REDIS_HOST")
redis_port = int(os.environ.get("REDIS_PORT"))
redis_password = os.environ.get("REDIS_PASSWORD")
redis_client = redis.Redis(host=redis_host, port=redis_port, password=redis_password, ssl=True)

# JWT configuration
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(days=30)
db = db_factory.get_db_instance()

# Token generation functions
def generate_access_token(user_id):
    return jwt.encode({
        'user_id': user_id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'iat': datetime.datetime.now(datetime.timezone.utc),
        'type': 'access'
    }, os.environ.get("SECRET_KEY"), algorithm="HS256")

def generate_refresh_token(user_id: int) -> str:
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
        db.set_revoked_status(data['token'], True)
        return jsonify({'message': 'Refresh token has expired!'}), 401
    
    # Get user
    user = db.get_user(user_id=user_id)
    
    if not user:
        return jsonify({'message': 'User not found!'}), 401
    
    # Generate new access token
    access_token = generate_access_token(user_id)
    
    # Token rotation: revoke the old refresh token and generate a new one
    # db.set_revoked_status(data['refresh_token'], True)
    # new_refresh_token = generate_refresh_token(user_id)
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': data['refresh_token']
    }), 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
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
    return jsonify({
        'id': current_user[0],
        'email': current_user[2],
        'username': current_user[1],
        'auth_provider': current_user[4]
    }), 200

@app.route('/api/exam/generate', methods=['POST', 'OPTIONS'])
def generate_exam():
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
    

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    
    # Ensure CORS is properly enabled on the deployed app
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        allowed_origins = ["http://localhost:3000", "https://avgr.vercel.app"]
        
        if origin in allowed_origins:
            # Don't add the header if it's already there
            if 'Access-Control-Allow-Origin' not in response.headers:
                response.headers.add('Access-Control-Allow-Origin', origin)
            if 'Access-Control-Allow-Headers' not in response.headers:
                response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
            if 'Access-Control-Allow-Methods' not in response.headers:
                response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
            if 'Access-Control-Allow-Credentials' not in response.headers:
                response.headers.add('Access-Control-Allow-Credentials', 'true')
            # Handle multipart form data properly
            if request.method == 'OPTIONS':
                if 'Access-Control-Max-Age' not in response.headers:
                    response.headers.add('Access-Control-Max-Age', '3600')
                    
        # Handle 401 responses specially to ensure CORS headers are included
        if response.status_code == 401 and origin in allowed_origins:
            if 'Access-Control-Allow-Origin' not in response.headers:
                response.headers.add('Access-Control-Allow-Origin', origin)
        
        return response
    
    app.run(host='0.0.0.0', port=5000, debug=True) 