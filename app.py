# from flask import Flask, render_template, Response, jsonify, redirect, url_for, session, request
# import cv2
# import numpy as np
# import math
# import time, os
# from threading import Lock
# from cvzone.HandTrackingModule import HandDetector
# import tensorflow as tf
# from tensorflow.keras.layers import DepthwiseConv2D

# import firebase_admin
# from firebase_admin import credentials, auth, db

# # Custom DepthwiseConv2D class to handle legacy models
# class CompatibleDepthwiseConv2D(DepthwiseConv2D):
#     def __init__(self, *args, **kwargs):
#         kwargs.pop('groups', None)
#         super().__init__(*args, **kwargs)

# # Initialize Firebase
# cred = credentials.Certificate("hand-snake-game-f3768-firebase-adminsdk-fbsvc-afa99b1386.json")
# firebase_admin.initialize_app(cred, {
#     'databaseURL': 'https://hand-sanke-game.firebaseio.com/'
# })
# app = Flask(__name__)
# app.secret_key = 'a48e14a0d5d3233f18ac4c46547685c9fd39e21af5c072d0' 

# # Configuration
# IMG_SIZE = 300
# OFFSET = 20
# LABELS = ["Up", "Down", "Right", "Left"]
# TARGET_FPS = 30

# # Global variables
# camera_on = False
# processing_on = False
# camera = None
# detector = HandDetector(maxHands=1, detectionCon=0.7)
# model = None
# interpreter = None
# input_details = None
# output_details = None
# camera_lock = Lock()
# current_gesture = "None"

# def init_camera():
#     global camera
#     if camera is None:
#         camera = cv2.VideoCapture(0)
#         camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
#         camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
#         camera.set(cv2.CAP_PROP_FPS, TARGET_FPS)

# @app.route('/gesture_stream')
# def gesture_stream():
#     def generate():
#         global current_gesture
#         while True:
#             yield f"data: {current_gesture}\n\n"
#             time.sleep(0.1)
#     return Response(generate(), content_type='text/event-stream')

# def load_model():
#     global model, interpreter, input_details, output_details
#     print("Loading model...")
#     try:
#         # Try loading Keras model first
#         model = tf.keras.models.load_model(
#             "Model/keras_model.h5",
#             custom_objects={'DepthwiseConv2D': CompatibleDepthwiseConv2D}
#         )
#         print("Keras model loaded successfully")
#     except Exception as e:
#         print(f"Keras model loading failed: {str(e)}")
#         try:
#             # Fallback to TensorFlow Lite
#             interpreter = tf.lite.Interpreter(model_path="Model/converted_model.tflite")
#             interpreter.allocate_tensors()
#             input_details = interpreter.get_input_details()
#             output_details = interpreter.get_output_details()
#             print("TensorFlow Lite model loaded successfully")
#         except Exception as e:
#             print(f"Model loading failed completely: {str(e)}")
#             raise

# def safe_predict(img):
#     """Handle prediction with either Keras or TFLite model"""
#     global current_gesture
#     try:
#         img = cv2.resize(img, (224, 224))
        
#         if model is not None:
#             # Keras model prediction
#             img_array = np.expand_dims(img, axis=0)
#             img_array = img_array / 255.0
#             predictions = model.predict(img_array)
#         elif interpreter is not None:
#             # TFLite model prediction
#             img_array = img.astype(np.float32)
#             img_array = np.expand_dims(img_array, axis=0)
#             interpreter.set_tensor(input_details[0]['index'], img_array)
#             interpreter.invoke()
#             predictions = interpreter.get_tensor(output_details[0]['index'])
#         else:
#             return np.zeros(len(LABELS)), 0
            
#         index = np.argmax(predictions[0])
#         confidence = predictions[0][index]
        
#         # Only update gesture if confidence is high enough
#         if confidence > 0.7:  # 70% confidence threshold
#             current_gesture = LABELS[index] if index < len(LABELS) else "Unknown"
#         else:
#             current_gesture = "None"
            
#         return predictions[0], index
#     except Exception as e:
#         print(f"Prediction failed: {str(e)}")
#         current_gesture = "Error"
#         return np.zeros(len(LABELS)), 0

# def process_frame(frame):
#     global current_gesture
#     try:
#         hands, _ = detector.findHands(frame, draw=False)
#         if not hands:
#             current_gesture = "None"
#             return frame

#         hand = hands[0]
#         x, y, w, h = hand['bbox']

#         # Validate crop area
#         x1, y1 = max(0, x-OFFSET), max(0, y-OFFSET)
#         x2, y2 = min(frame.shape[1], x+w+OFFSET), min(frame.shape[0], y+h+OFFSET)

#         imgCrop = frame[y1:y2, x1:x2]
#         if imgCrop.size == 0:
#             return frame

#         # Process based on aspect ratio
#         aspectRatio = h / w
#         imgWhite = np.ones((IMG_SIZE, IMG_SIZE, 3), np.uint8) * 255

#         if aspectRatio > 1:
#             k = IMG_SIZE / h
#             wCal = math.ceil(k * w)
#             imgResize = cv2.resize(imgCrop, (wCal, IMG_SIZE))
#             wGap = math.ceil((IMG_SIZE - wCal) / 2)
#             imgWhite[:, wGap:wCal+wGap] = imgResize
#         else:
#             k = IMG_SIZE / w
#             hCal = math.ceil(k * h)
#             imgResize = cv2.resize(imgCrop, (IMG_SIZE, hCal))
#             hGap = math.ceil((IMG_SIZE - hCal) / 2)
#             imgWhite[hGap:hCal+hGap, :] = imgResize

#         # Get prediction
#         _, index = safe_predict(imgWhite)
#         label = LABELS[index] if index < len(LABELS) else "Unknown"

#         # Draw results on the frame
#         cv2.putText(frame, label, (x, y - 26), cv2.FONT_HERSHEY_COMPLEX, 1.7, (255, 0, 255), 2)
#         cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 255), 4)

#     except Exception as e:
#         print(f"Frame processing error: {str(e)}")
#         current_gesture = "Error"
    
#     return frame

# def gen_frames():
#     global camera_on, processing_on
#     last_time = time.time()
    
#     while camera_on:
#         try:
#             # Control frame rate
#             elapsed = time.time() - last_time
#             if elapsed < 1/TARGET_FPS:
#                 time.sleep((1/TARGET_FPS) - elapsed)
#             last_time = time.time()
            
#             # Get frame
#             with camera_lock:
#                 if camera is None:
#                     break
#                 success, frame = camera.read()
            
#             if not success:
#                 continue
                
#             frame = cv2.flip(frame, 1)
            
#             if processing_on:
#                 frame = process_frame(frame)
#             else:
#                 cv2.putText(frame, "PROCESSING: OFF", (20, 40), 
#                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
#             # Encode frame
#             ret, buffer = cv2.imencode('.jpg', frame)
#             if ret:
#                 yield (b'--frame\r\n'
#                        b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
                
#         except Exception as e:
#             print(f"Frame generation error: {str(e)}")
#             time.sleep(0.1)

# @app.route('/profile')
# def profile():
#     if 'user' not in session:
#         return redirect(url_for('login'))
#     return redirect(url_for('index'))

# @app.route('/login', methods=['GET', 'POST'])
# def login():
#     if request.method == 'POST':
#         email = request.form.get('email')
#         password = request.form.get('password')
        
#         try:
#             user = auth.get_user_by_email(email)
#             session['user'] = {
#                 'email': email,
#                 'username': user.display_name or email.split('@')[0]
#             }
#             return redirect(url_for('index'))
#         except Exception as e:
#             return render_template('login.html', error=str(e))
    
#     return render_template('login.html')

# @app.route('/signup', methods=['POST'])
# def signup():
#     email = request.form.get('email')
#     password = request.form.get('password')
#     username = request.form.get('username')
    
#     try:
#         user = auth.create_user(
#             email=email,
#             password=password,
#             display_name=username
#         )
        
#         ref = db.reference('users')
#         ref.child(user.uid).set({
#             'username': username,
#             'email': email,
#             'high_score': 0
#         })
        
#         return redirect(url_for('login'))
#     except Exception as e:
#         return render_template('login.html', error=str(e))
    
# @app.route('/logout', methods=['POST'])
# def logout():
#     session.pop('user', None)
#     return redirect(url_for('index'))

# @app.route('/check-auth')
# def check_auth():
#     if 'user' in session:
#         return jsonify({
#             'authenticated': True,
#             'user': {
#                 'display_name': session['user'].get('username', 'User')
#             }
#         })
#     return jsonify({'authenticated': False})

# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/video_feed')
# def video_feed():
#     return Response(gen_frames(),
#                   mimetype='multipart/x-mixed-replace; boundary=frame')

# @app.route('/camera_control/<command>')
# def camera_control(command):
#     global camera_on, processing_on, camera
    
#     try:
#         if command == 'start':
#             camera_on = True
#             init_camera()
#             return jsonify(status="Camera started")
#         elif command == 'stop':
#             camera_on = False
#             processing_on = False
#             if camera:
#                 with camera_lock:
#                     camera.release()
#                     camera = None
#             return jsonify(status="Camera stopped")
#         elif command == 'enable_processing':
#             try:
#                 load_model()
#                 processing_on = True
#                 return jsonify(status="Processing enabled")
#             except Exception as e:
#                 return jsonify(status=f"Processing enable failed: {str(e)}"), 500
#         elif command == 'disable_processing':
#             processing_on = False
#             return jsonify(status="Processing disabled")
#         return jsonify(status="Invalid command"), 400
#     except Exception as e:
#         return jsonify(status=f"Server error: {str(e)}"), 500
    
# if __name__ == '__main__':
#     app.run(debug=True, threaded=True, host='0.0.0.0', port=8000)




    
from flask import Flask, render_template, Response, jsonify, redirect, url_for, session, request
import cv2
import numpy as np
import math
import time, os, datetime
from threading import Lock
from cvzone.HandTrackingModule import HandDetector
import tensorflow as tf
from tensorflow.keras.layers import DepthwiseConv2D
import firebase_admin
from firebase_admin import credentials, auth, db, firestore
from functools import wraps
from flask_cors import CORS

# Custom DepthwiseConv2D class to handle legacy models
class CompatibleDepthwiseConv2D(DepthwiseConv2D):
    def __init__(self, *args, **kwargs):
        kwargs.pop('groups', None)
        super().__init__(*args, **kwargs)

# Initialize Firebase
cred = credentials.Certificate("hand-snake-game-f3768-firebase-adminsdk-fbsvc-afa99b1386.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://hand-sanke-game.firebaseio.com/'
})

# Initialize Firestore
db_firestore = firestore.client()

app = Flask(__name__)
CORS(app)
app.secret_key = 'a48e14a0d5d3233f18ac4c46547685c9fd39e21af5c072d0' 

# Configuration
IMG_SIZE = 300
OFFSET = 20
LABELS = ["Up", "Down", "Right", "Left"]
TARGET_FPS = 30

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

def safe_predict(img):
    """Handle prediction with either Keras or TFLite model"""
    global current_gesture
    try:
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
        
        # Only update gesture if confidence is high enough
        if confidence > 0.7:  # 70% confidence threshold
            current_gesture = LABELS[index] if index < len(LABELS) else "Unknown"
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
        hands, _ = detector.findHands(frame, draw=False)
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
        label = LABELS[index] if index < len(LABELS) else "Unknown"

        # Draw results on the frame
        cv2.putText(frame, label, (x, y - 26), cv2.FONT_HERSHEY_COMPLEX, 1.7, (255, 0, 255), 2)
        cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 255), 4)

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

@app.route('/login', methods=['GET','POST'])
def login():
    email = request.form.get('email')
    password = request.form.get('password')
    
    try:
        # Verify password with Firebase
        user = auth.get_user_by_email(email)
        # Create a custom token for client-side auth
        custom_token = auth.create_custom_token(user.uid)
        
        session['user'] = {
            'uid': user.uid,
            'email': email,
            'username': user.display_name or email.split('@')[0],
            'token': custom_token
        }
        
        return redirect(url_for('index'))
    except Exception as e:
        return render_template('header_content/login.html', error=str(e))

@app.route('/signup', methods=['POST'])
def signup():
    email = request.form.get('email')
    password = request.form.get('password')
    username = request.form.get('username')
    
    try:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=username
        )
        
        # Create user in Firestore
        user_ref = db_firestore.collection('users').document(user.uid)
        user_ref.set({
            'username': username,
            'email': email,
            'created_at': firestore.SERVER_TIMESTAMP
        })
        
        # Initialize empty leaderboard entries
        for mode in ['keyboard', 'gesture']:
            db_firestore.collection('leaderboard').document(mode).collection('users').document(user.uid).set({
                'userId': user.uid,
                'username': username,
                'highScore': 0,
                'timestamp': firestore.SERVER_TIMESTAMP
            })
        
        return redirect(url_for('login'))
    except Exception as e:
        return render_template('login.html', error=str(e))
    
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


@app.route('/contact')
def contact_page():
    return render_template('footer_content/contact.html')

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
    app.run(debug=True, threaded=True, host='0.0.0.0', port=8000)