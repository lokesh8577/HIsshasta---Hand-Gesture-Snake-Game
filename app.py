from flask import Flask, render_template, Response, jsonify, redirect, url_for, session, request
import cv2
import numpy as np
import math
import time, os
from threading import Lock
from cvzone.HandTrackingModule import HandDetector
import tensorflow as tf
from tensorflow.keras.layers import DepthwiseConv2D

import firebase_admin
from firebase_admin import credentials, auth, db

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
app = Flask(__name__)
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

@app.route('/profile')
def profile():
    if 'user' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('index'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        try:
            user = auth.get_user_by_email(email)
            session['user'] = {
                'email': email,
                'username': user.display_name or email.split('@')[0]
            }
            return redirect(url_for('index'))
        except Exception as e:
            return render_template('login.html', error=str(e))
    
    return render_template('login.html')

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
        
        ref = db.reference('users')
        ref.child(user.uid).set({
            'username': username,
            'email': email,
            'high_score': 0
        })
        
        return redirect(url_for('login'))
    except Exception as e:
        return render_template('login.html', error=str(e))
    
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
                'display_name': session['user'].get('username', 'User')
            }
        })
    return jsonify({'authenticated': False})

@app.route('/')
def index():
    return render_template('index.html')

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