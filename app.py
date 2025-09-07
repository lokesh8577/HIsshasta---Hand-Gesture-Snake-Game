from flask import Flask, render_template, Response, jsonify, redirect, url_for, session, request
import cv2
import numpy as np
import math
import time, os, datetime
from threading import Lock
from cvzone.HandTrackingModule import HandDetector
import requests
from firebase_admin import credentials
from firebase_admin.exceptions import FirebaseError
import tensorflow as tf
from tensorflow.keras.layers import DepthwiseConv2D
import firebase_admin
from firebase_admin import credentials, auth, db, firestore
from functools import wraps
from flask_cors import CORS
from firebase_admin import auth, exceptions as firebase_exceptions
from collections import deque
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Custom DepthwiseConv2D class to handle legacy models
class CompatibleDepthwiseConv2D(DepthwiseConv2D):
    def __init__(self, *args, **kwargs):
        kwargs.pop('groups', None)
        super().__init__(*args, **kwargs)

# Firebase configuration as dictionary
FIREBASE_CONFIG = {
    "type": os.getenv('FIREBASE_TYPE'),
    "project_id": os.getenv('FIREBASE_PROJECT_ID'),
    "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
    "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
    "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
    "client_id": os.getenv('FIREBASE_CLIENT_ID'),
    "auth_uri": os.getenv('FIREBASE_AUTH_URI'),
    "token_uri": os.getenv('FIREBASE_TOKEN_URI'),
    "auth_provider_x509_cert_url": os.getenv('FIREBASE_AUTH_PROVIDER_CERT_URL'),
    "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_CERT_URL'),
    "universe_domain": os.getenv('FIREBASE_UNIVERSE_DOMAIN')
}


# Initialize Firebase with embedded credentials
cred = credentials.Certificate(FIREBASE_CONFIG)
firebase_admin.initialize_app(cred, {
    'databaseURL': os.getenv('FIREBASE_DATABASE_URL')
})
# Initialize Firestore
db_firestore = firestore.client()

app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv('FLASK_SECRET_KEY')

# Configuration
IMG_SIZE = 300
OFFSET = 20
TARGET_FPS = 60
MIN_CONFIDENCE = 0.7
SMOOTHING_WINDOW = 5

# Global variables
camera_on = False
processing_on = False
camera = None
detector = HandDetector(maxHands=1, detectionCon=0.7)
model = None
interpreter = None
input_details = None
output_details = None
camera_lock = Lock()
current_gesture = "None"
prediction_history = deque(maxlen=SMOOTHING_WINDOW)
LABELS = []

# Authentication decorator
def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        id_token = request.headers.get('Authorization', '').split('Bearer ')[-1]
        if not id_token:
            return jsonify({'error': 'Authorization token missing'}), 401
        try:
            decoded_token = auth.verify_id_token(id_token)
            kwargs['user_id'] = decoded_token['uid']
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 401
    return decorated_function

def init_camera():
    global camera
    if camera is None:
        camera = cv2.VideoCapture(0)
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        camera.set(cv2.CAP_PROP_FPS, TARGET_FPS)

@app.route('/gesture_stream')
def gesture_stream():
    def generate():
        global current_gesture
        while True:
            yield f"data: {current_gesture}\n\n"
            time.sleep(0.1)
    return Response(generate(), content_type='text/event-stream')

def load_model():
    global model, interpreter, input_details, output_details
    print("Loading model...")
    try:
        # Try loading Keras model first
        model = tf.keras.models.load_model(
            "Model/keras_model.h5",
            custom_objects={'DepthwiseConv2D': CompatibleDepthwiseConv2D}
        )
        print("Keras model loaded successfully")
    except Exception as e:
        print(f"Keras model loading failed: {str(e)}")
        try:
            # Fallback to TensorFlow Lite
            interpreter = tf.lite.Interpreter(model_path="Model/converted_model.tflite")
            interpreter.allocate_tensors()
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            print("TensorFlow Lite model loaded successfully")
        except Exception as e:
            print(f"Model loading failed completely: {str(e)}")
            raise
    load_labels()

def load_labels():
    global LABELS
    try:
        with open("Model/labels.txt", "r") as f:
            LABELS = [line.strip().split()[-1] for line in f.readlines()]
        print(f"Loaded {len(LABELS)} labels")
    except Exception as e:
        print(f"Error loading labels: {str(e)}")
        LABELS = ["Up", "Down", "Right", "Left", "Stop"]  # Fallback

def safe_predict(img):
    """Handle prediction with either Keras or TFLite model"""
    global current_gesture, prediction_history
    try:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert to RGB for model compatibility
        img = cv2.resize(img, (224, 224))
        
        if model is not None:
            # Keras model prediction
            img_array = np.expand_dims(img, axis=0)
            img_array = img_array / 255.0
            predictions = model.predict(img_array)
        elif interpreter is not None:
            # TFLite model prediction
            img_array = img.astype(np.float32)
            img_array = np.expand_dims(img_array, axis=0)
            interpreter.set_tensor(input_details[0]['index'], img_array)
            interpreter.invoke()
            predictions = interpreter.get_tensor(output_details[0]['index'])
        else:
            return np.zeros(len(LABELS)), 0
            
        index = np.argmax(predictions[0])
        confidence = predictions[0][index]
        
        # Smoothing logic
        if confidence >= MIN_CONFIDENCE:
            prediction_history.append(index)
            if len(prediction_history) < SMOOTHING_WINDOW:
                smoothed_index = index
            else:
                counts = np.bincount(prediction_history)
                smoothed_index = np.argmax(counts)
                if counts[smoothed_index] <= len(prediction_history) * 0.6:
                    smoothed_index = index
            current_gesture = LABELS[smoothed_index] if smoothed_index < len(LABELS) else "Unknown"
        else:
            current_gesture = "None"
            
        return predictions[0], index
    except Exception as e:
        print(f"Prediction failed: {str(e)}")
        current_gesture = "Error"
        return np.zeros(len(LABELS)), 0

def process_frame(frame):
    global current_gesture
    try:
        hands, frame = detector.findHands(frame, draw=False)  # Disable default drawing
        
        CIRCLE_COLOR = (0, 0, 255)      # Red circles
        LINE_COLOR = (0, 140, 255)        # Deep gold lines
        RECTANGLE_COLOR = (0, 0, 0)       # Black rectangle
        TEXT_COLOR = (0, 0, 0)      # White text

        
        if hands:
            hand = hands[0]
            lmList = hand.get('lmList', [])  # Get landmark list
            
            # Draw landmark points (circles)
            if lmList:
                for lm in lmList:
                    x, y = lm[0], lm[1]
                    cv2.circle(frame, (x, y), 5, CIRCLE_COLOR, cv2.FILLED)
            
            # Draw landmark connections (lines)
            connections = [
                (0, 1), (1, 2), (2, 3), (3, 4),  # Thumb
                (0, 5), (5, 6), (6, 7), (7, 8),  # Index
                (5, 9), (9, 10), (10, 11), (11, 12),  # Middle
                (9, 13), (13, 14), (14, 15), (15, 16),  # Ring
                (13, 17), (17, 18), (18, 19), (19, 20),  # Pinky
                (0, 17), (5, 17)  # Palm connections
            ]
            
            for start, end in connections:
                if len(lmList) > max(start, end):
                    x1, y1 = lmList[start][0], lmList[start][1]
                    x2, y2 = lmList[end][0], lmList[end][1]
                    cv2.line(frame, (x1, y1), (x2, y2), LINE_COLOR, 2)
        
        if not hands:
            current_gesture = "None"
            return frame

        hand = hands[0]
        x, y, w, h = hand['bbox']

        # Validate crop area
        x1, y1 = max(0, x-OFFSET), max(0, y-OFFSET)
        x2, y2 = min(frame.shape[1], x+w+OFFSET), min(frame.shape[0], y+h+OFFSET)

        imgCrop = frame[y1:y2, x1:x2]
        if imgCrop.size == 0:
            return frame

        # Process based on aspect ratio
        aspectRatio = h / w
        imgWhite = np.ones((IMG_SIZE, IMG_SIZE, 3), np.uint8) * 255

        if aspectRatio > 1:
            k = IMG_SIZE / h
            wCal = math.ceil(k * w)
            imgResize = cv2.resize(imgCrop, (wCal, IMG_SIZE))
            wGap = math.ceil((IMG_SIZE - wCal) / 2)
            imgWhite[:, wGap:wCal+wGap] = imgResize
        else:
            k = IMG_SIZE / w
            hCal = math.ceil(k * h)
            imgResize = cv2.resize(imgCrop, (IMG_SIZE, hCal))
            hGap = math.ceil((IMG_SIZE - hCal) / 2)
            imgWhite[hGap:hCal+hGap, :] = imgResize

        # Get prediction
        _, index = safe_predict(imgWhite)
        label = current_gesture  # Use smoothed gesture

        # Draw results on the frame with custom colors
        cv2.putText(frame, label, (x, y - 26), cv2.FONT_HERSHEY_COMPLEX, 1.7, TEXT_COLOR, 2)
        cv2.rectangle(frame, (x1, y1), (x2, y2), RECTANGLE_COLOR, 4)

    except Exception as e:
        print(f"Frame processing error: {str(e)}")
        current_gesture = "Error"
    
    return frame


def gen_frames():
    global camera_on, processing_on
    last_time = time.time()
    
    while camera_on:
        try:
            # Control frame rate
            elapsed = time.time() - last_time
            if elapsed < 1/TARGET_FPS:
                time.sleep((1/TARGET_FPS) - elapsed)
            last_time = time.time()
            
            # Get frame
            with camera_lock:
                if camera is None:
                    break
                success, frame = camera.read()
            
            if not success:
                continue
                
            frame = cv2.flip(frame, 1)
            
            if processing_on:
                frame = process_frame(frame)
            else:
                cv2.putText(frame, "PROCESSING: OFF", (20, 40), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            # Encode frame
            ret, buffer = cv2.imencode('.jpg', frame)
            if ret:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
                
        except Exception as e:
            print(f"Frame generation error: {str(e)}")
            time.sleep(0.1)

# Leaderboard API Endpoints
@app.route('/api/update_leaderboard', methods=['POST'])
@auth_required
def update_leaderboard(user_id):
    try:
        data = request.get_json()
        mode = data.get('mode')
        username = data.get('username')
        score = data.get('score')
        
        if not all([mode, username, score]):
            return jsonify({'error': 'Missing required fields'}), 400
            
        if mode not in ['keyboard', 'gesture']:
            return jsonify({'error': 'Invalid mode'}), 400
            
        # Get current timestamp and session expiration (1 minute from now)
        current_time = firestore.SERVER_TIMESTAMP
        session_expiry = datetime.datetime.now() + datetime.timedelta(minutes=1)
        
        # Get user's current high score
        user_ref = db_firestore.collection('leaderboard').document(mode).collection('users').document(user_id)
        user_data = user_ref.get()
        
        if user_data.exists:
            existing_score = user_data.to_dict().get('highScore', 0)
            if score <= existing_score:
                return jsonify({
                    'status': 'no_update', 
                    'current_score': existing_score,
                    'session_expiry': session_expiry.isoformat()
                })
        
        # Update leaderboard with session info
        user_ref.set({
            'userId': user_id,
            'username': username,
            'highScore': score,
            'timestamp': current_time,
            'session_expiry': session_expiry,
            'in_session': True
        }, merge=True)
        
        return jsonify({
            'status': 'success', 
            'new_score': score,
            'session_expiry': session_expiry.isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/leaderboard')
def get_leaderboard():
    try:
        mode = request.args.get('mode', 'keyboard')
        limit = int(request.args.get('limit', 10))  # Default to 10 if not specified
        
        if mode not in ['keyboard', 'gesture']:
            return jsonify({'error': 'Invalid mode'}), 400
            
        # Initialize Firestore query
        users_ref = db_firestore.collection('leaderboard').document(mode).collection('users')
        
        # Get active sessions (those not expired)
        now = datetime.datetime.now(datetime.timezone.utc)
        active_query = users_ref.where('session_expiry', '>', now)
        
        # Execute both queries
        active_results = list(active_query.stream())
        top_results = list(users_ref.order_by('highScore', direction=firestore.Query.DESCENDING).limit(limit).stream())
        
        # Process results
        leaderboard = []
        user_ids = set()
        
        # Add active sessions first
        for doc in active_results:
            data = doc.to_dict()
            if data.get('userId') not in user_ids:
                leaderboard.append({
                    'userId': data.get('userId'),
                    'username': data.get('username', 'Anonymous'),
                    'score': data.get('highScore', 0),
                    'in_session': True
                })
                user_ids.add(data.get('userId'))
        
        # Add top scores (excluding duplicates)
        for doc in top_results:
            data = doc.to_dict()
            if data.get('userId') not in user_ids:
                leaderboard.append({
                    'userId': data.get('userId'),
                    'username': data.get('username', 'Anonymous'),
                    'score': data.get('highScore', 0),
                    'in_session': False
                })
                user_ids.add(data.get('userId'))
        
        # Sort by score and add ranks
        leaderboard.sort(key=lambda x: x['score'], reverse=True)
        for i, entry in enumerate(leaderboard[:limit], 1):
            entry['rank'] = i
        
        return jsonify(leaderboard[:limit])
        
    except Exception as e:
        app.logger.error(f"Leaderboard error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Failed to load leaderboard'}), 500


@app.route('/api/update_user_score', methods=['POST'])
@auth_required
def update_user_score(user_id):
    try:
        data = request.get_json()
        mode = data.get('mode')
        score = data.get('score')
        
        if not all([mode, score]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
            
        if mode not in ['keyboard', 'gesture']:
            return jsonify({'success': False, 'message': 'Invalid mode'}), 400
            
        # Get user's current high score
        user_ref = db_firestore.collection('users').document(user_id)
        user_data = user_ref.get()
        
        current_high_score = 0
        if user_data.exists:
            current_high_score = user_data.to_dict().get(f'{mode}_high_score', 0)
        
        # Only update if the new score is higher
        if score > current_high_score:
            user_ref.set({
                f'{mode}_high_score': score,
                'last_updated': firestore.SERVER_TIMESTAMP
            }, merge=True)
            return jsonify({'success': True, 'message': 'High score updated'})
        else:
            return jsonify({'success': False, 'message': 'Score not higher than current high score'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# User Authentication Routes
@app.route('/profile')
def profile():
    if 'user' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('index'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('header_content/login.html')
    
    email = request.form.get('email')
    password = request.form.get('password')
    
    try:
        # First check if email exists
        try:
            user = auth.get_user_by_email(email)
        except auth.UserNotFoundError:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'success': False,
                    'field': 'email',
                    'message': 'Email not found'
                }), 401
            return render_template('header_content/login.html', 
                                login_error="Email not found",
                                login_email=email)

        # Verify password using Firebase REST API
        FIREBASE_WEB_API_KEY = os.getenv('FIREBASE_WEB_API_KEY')
        rest_api_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={FIREBASE_WEB_API_KEY}"
        
        data = {
            "email": email,
            "password": password,
            "returnSecureToken": True
        }
        
        response = requests.post(rest_api_url, json=data)
        response_data = response.json()
        
        if 'error' in response_data:
            error_msg = response_data['error']['message']
            # Check if the email exists but password is wrong
            if error_msg == "INVALID_LOGIN_CREDENTIALS":
                # Since we already checked email exists, this must be wrong password
                error_msg = "Incorrect password"
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return jsonify({
                        'success': False,
                        'field': 'password',
                        'message': error_msg
                    }), 401
                return render_template('header_content/login.html', 
                                    login_error=error_msg,
                                    login_email=email)
            elif error_msg == "TOO_MANY_ATTEMPTS_TRY_LATER":
                error_msg = "Too many attempts. Try again later"
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'success': False,
                    'field': 'general',
                    'message': error_msg
                }), 401
            return render_template('header_content/login.html', 
                                login_error=error_msg,
                                login_email=email)
        
        # Login successful
        custom_token = auth.create_custom_token(user.uid)
        
        session['user'] = {
            'uid': user.uid,
            'email': email,
            'username': user.display_name or email.split('@')[0],
            'token': custom_token.decode('utf-8') if isinstance(custom_token, bytes) else custom_token
        }
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': True,
                'message': 'Login successful'
            })
        return redirect(url_for('index'))
        
    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': False,
                'field': 'general',
                'message': str(e)
            }), 500
        return render_template('header_content/login.html', 
                            login_error="An error occurred. Please try again.",
                            login_email=email)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        return render_template('header_content/login.html')
    
    email = request.form.get('email')
    password = request.form.get('password')
    username = request.form.get('username').strip()  # Remove whitespace
    
    try:
        # First check if username exists in Firestore
        users_ref = db_firestore.collection('users')
        username_query = users_ref.where('username', '==', username).limit(1).get()
        
        if len(username_query) > 0:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'success': False,
                    'field': 'username',
                    'message': 'Username already exists'
                }), 400
            return render_template('header_content/login.html',
                                 signup_error="Username already exists",
                                 signup_email=email,
                                 signup_username=username)
        
        # Then check if email exists in Firebase Auth
        try:
            existing_user = auth.get_user_by_email(email)
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'success': False,
                    'field': 'email',
                    'message': 'Email already exists'
                }), 400
            return render_template('header_content/login.html',
                                 signup_error="Email already exists",
                                 signup_email=email,
                                 signup_username=username)
        except auth.UserNotFoundError:
            pass  # Email doesn't exist - this is good
        
        # Create the user if checks pass
        user = auth.create_user(
            email=email,
            password=password,
            display_name=username
        )
        
        # Store additional user data in Firestore
        user_ref = db_firestore.collection('users').document(user.uid)
        user_ref.set({
            'username': username,
            'email': email,
            'created_at': firestore.SERVER_TIMESTAMP
        })
        
        # Initialize leaderboard entries
        for mode in ['keyboard', 'gesture']:
            db_firestore.collection('leaderboard').document(mode).collection('users').document(user.uid).set({
                'userId': user.uid,
                'username': username,
                'highScore': 0,
                'timestamp': firestore.SERVER_TIMESTAMP
            })
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': True,
                'message': 'Account created successfully! Please login.'
            })
        return render_template('header_content/login.html',
                             login_success="Account created successfully! Please login.",
                             login_email=email)
        
    except Exception as e:
        error_msg = str(e)
        if "WEAK_PASSWORD" in error_msg:
            error_msg = "Password must be at least 6 characters"
            field = 'password'
        elif "INVALID_EMAIL" in error_msg:
            error_msg = "Invalid email address"
            field = 'email'
        else:
            field = 'general'
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': False,
                'field': field,
                'message': error_msg
            }), 400
        return render_template('header_content/login.html',
                             signup_error=error_msg,
                             signup_email=email,
                             signup_username=username)

@app.route('/get_firebase_token')
def get_firebase_token():
    if 'user' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    try:
        custom_token = auth.create_custom_token(session['user']['uid'])
        return jsonify({'token': custom_token.decode('utf-8')})
    except Exception as e:
        return jsonify({'error': str(e)}), 500   
    
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return redirect(url_for('index'))

@app.route('/check-auth')
def check_auth():
    if 'user' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'display_name': session['user'].get('username', 'User'),
                'uid': session['user'].get('uid', '')
            }
        })
    return jsonify({'authenticated': False})


# Main Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/leaderboard')
def leaderboard_page():
    return render_template('header_content/leaderboard.html')

@app.route('/history')
def history_page():
    return render_template('header_content/history.html')


@app.route('/setting')
def setting_page():
    return render_template('header_content/setting.html')


@app.route('/theme')
def theme_page():
    return render_template('header_content/theme.html')


@app.route('/feedback')
def feedback_page():
    return render_template('footer_content/feedback.html')


@app.route('/terms')
def terms_page():
    return render_template('footer_content/terms.html')


@app.route('/security')
def security_page():
    return render_template('footer_content/security.html')

@app.route('/privacy')
def privacy_page():
    return render_template('footer_content/privacy.html')

@app.route('/permission')
def permission():
    return render_template('permission.html')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(),
                  mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/camera_control/<command>')
def camera_control(command):
    global camera_on, processing_on, camera
    
    try:
        if command == 'start':
            camera_on = True
            init_camera()
            return jsonify(status="Camera started")
        elif command == 'stop':
            camera_on = False
            processing_on = False
            if camera:
                with camera_lock:
                    camera.release()
                    camera = None
            return jsonify(status="Camera stopped")
        elif command == 'enable_processing':
            try:
                load_model()
                processing_on = True
                return jsonify(status="Processing enabled")
            except Exception as e:
                return jsonify(status=f"Processing enable failed: {str(e)}"), 500
        elif command == 'disable_processing':
            processing_on = False
            return jsonify(status="Processing disabled")
        return jsonify(status="Invalid command"), 400
    except Exception as e:
        return jsonify(status=f"Server error: {str(e)}"), 500
    
if __name__ == '__main__':
    app.run(debug=True, port=5000)