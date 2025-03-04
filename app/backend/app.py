from functools import wraps
import datetime
import secrets

from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from werkzeug.security import generate_password_hash, check_password_hash

import backend.database as dao
import backend.database.sqlitedb as sqlitedb


app = Flask(__name__)

# Allow all origins for testing purposes
CORS(app)

# JWT configuration
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes=15)  # Short-lived access tokens
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(days=30)    # Long-lived refresh tokens
app.config['SECRET_KEY'] = 'testingtestingtesting'
db = sqlitedb.SQLiteDB()

# Token generation functions
def generate_access_token(user_id):
    return jwt.encode({
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'iat': datetime.datetime.utcnow(),
        'type': 'access'
    }, app.config['SECRET_KEY'], algorithm="HS256")

def generate_refresh_token(user_id: int) -> str:
    token_value = secrets.token_hex(64)
    
    # Set expiration
    expires_at = datetime.datetime.now() + app.config['JWT_REFRESH_TOKEN_EXPIRES']

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
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            
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
    db.set_last_login(user[0], datetime.datetime.now())
    
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
        db.set_last_login(user_id, datetime.datetime.now())
    else:
        # For Google users, if a username is not provided, generate one based on the email.
        email_prefix = data['email'].split('@')[0]
        username = f"{email_prefix}_{secrets.token_hex(8)}"
        auth_provider = 'google'
        
        try:
            # password is None here as no password is required when signing in
            # using Google as the auth provider
            user_id = db.add_user(username, data['email'], None, 'google', data['oauth_id'])
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
    
    # Check if token is expired
    if datetime.datetime.strptime(expires_at, "%Y-%m-%d %H:%M:%S.%f") < datetime.datetime.now():
        db.set_revoked_status(data['token'], True)
        return jsonify({'message': 'Refresh token has expired!'}), 401
    
    # Get user
    user = db.get_user(user_id=user_id)
    
    if not user:
        return jsonify({'message': 'User not found!'}), 401
    
    # Generate new access token
    access_token = generate_access_token(user_id)
    
    # Token rotation: revoke the old refresh token and generate a new one
    db.set_revoked_status(data['refresh_token'], True)
    new_refresh_token = generate_refresh_token(user_id)
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': new_refresh_token
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

if __name__ == '__main__':
    app.run(debug=True)
