import cv2
import numpy as np
import math
from cvzone.HandTrackingModule import HandDetector
import tensorflow as tf
from tensorflow.keras.layers import DepthwiseConv2D
from collections import deque
import time

# Constants
IMG_SIZE = 300
OFFSET = 20
MIN_CONFIDENCE = 0.7  # Only accept predictions with confidence > 70%
SMOOTHING_WINDOW = 5  # Number of previous predictions to consider for smoothing

# Custom DepthwiseConv2D class for legacy model compatibility
class CompatibleDepthwiseConv2D(DepthwiseConv2D):
    def __init__(self, *args, **kwargs):
        kwargs.pop('groups', None)
        super().__init__(*args, **kwargs)

class GestureRecognizer:
    def __init__(self):
        self.cap = cv2.VideoCapture(0)
        self.detector = HandDetector(maxHands=1)
        self.model = None
        self.interpreter = None
        self.input_details = None
        self.output_details = None
        self.labels = []
        self.prediction_history = deque(maxlen=SMOOTHING_WINDOW)
        self.current_gesture = None
        self.last_prediction_time = time.time()
        
        self.initialize_model()
        self.load_labels()
        
    def initialize_model(self):
        """Initialize the model with fallback options"""
        try:
            # First try loading the Keras model
            self.model = tf.keras.models.load_model(
                "Model/keras_model.h5",
                custom_objects={'DepthwiseConv2D': CompatibleDepthwiseConv2D}
            )
            print("Loaded Keras model successfully")
        except Exception as e:
            print(f"Keras model loading failed: {e}")
            try:
                # Fallback to TensorFlow Lite
                self.interpreter = tf.lite.Interpreter(model_path="Model/converted_model.tflite")
                self.interpreter.allocate_tensors()
                self.input_details = self.interpreter.get_input_details()
                self.output_details = self.interpreter.get_output_details()
                print("Loaded TFLite model successfully")
            except Exception as e:
                raise RuntimeError(f"Could not load either H5 or TFLite model: {e}")
    
    def load_labels(self):
        """Load gesture labels from file"""
        try:
            with open("Model/labels.txt", "r") as f:
                self.labels = [line.strip() for line in f.readlines()]
            print(f"Loaded {len(self.labels)} labels")
        except Exception as e:
            print(f"Error loading labels: {e}")
            self.labels = ["Unknown"]  # Fallback label
    
    def preprocess_image(self, img):
        """Preprocess image for model input"""
        img = cv2.resize(img, (224, 224))
        if self.model:  # Keras model expects normalized input
            img = img / 255.0
        else:  # TFLite model
            img = img.astype(np.float32)
        return np.expand_dims(img, axis=0)
    
    def predict_gesture(self, img):
        """Run gesture prediction on the input image"""
        try:
            img_processed = self.preprocess_image(img)
            
            if self.model:
                # Keras model prediction
                predictions = self.model.predict(img_processed)
            else:
                # TFLite model prediction
                self.interpreter.set_tensor(self.input_details[0]['index'], img_processed)
                self.interpreter.invoke()
                predictions = self.interpreter.get_tensor(self.output_details[0]['index'])
            
            index = np.argmax(predictions)
            confidence = predictions[0][index]
            return index, confidence
        except Exception as e:
            print(f"Prediction error: {e}")
            return 0, 0.0  # Return unknown label with 0 confidence
    
    def smooth_prediction(self, current_index, current_confidence):
        """Apply smoothing to predictions to reduce fluctuations"""
        # Only consider confident predictions
        if current_confidence < MIN_CONFIDENCE:
            return self.current_gesture if self.current_gesture else (0, 0.0)
        
        # Add current prediction to history
        self.prediction_history.append(current_index)
        
        # If we don't have enough history, return current prediction
        if len(self.prediction_history) < SMOOTHING_WINDOW:
            return current_index, current_confidence
        
        # Find the most common prediction in history
        counts = np.bincount(self.prediction_history)
        smoothed_index = np.argmax(counts)
        
        # Only update if we have a clear majority
        if counts[smoothed_index] > len(self.prediction_history) * 0.6:
            return smoothed_index, current_confidence
        else:
            return current_index, current_confidence
    
    def process_frame(self):
        """Process a single frame from the camera"""
        success, img = self.cap.read()
        if not success:
            return None
        
        img = cv2.flip(img, 1)
        img_output = img.copy()
        hands, img = self.detector.findHands(img)
        
        if hands:
            hand = hands[0]
            x, y, w, h = hand['bbox']
            
            img_white = np.ones((IMG_SIZE, IMG_SIZE, 3), np.uint8) * 255
            img_crop = img[y-OFFSET:y+h+OFFSET, x-OFFSET:x+w+OFFSET]
            
            try:
                aspect_ratio = h / w
                
                if aspect_ratio > 1:
                    k = IMG_SIZE / h
                    w_cal = math.ceil(k * w)
                    img_resize = cv2.resize(img_crop, (w_cal, IMG_SIZE))
                    w_gap = math.ceil((IMG_SIZE - w_cal) / 2)
                    img_white[:, w_gap:w_cal+w_gap] = img_resize
                else:
                    k = IMG_SIZE / w
                    h_cal = math.ceil(k * h)
                    img_resize = cv2.resize(img_crop, (IMG_SIZE, h_cal))
                    h_gap = math.ceil((IMG_SIZE - h_cal) / 2)
                    img_white[h_gap:h_cal+h_gap, :] = img_resize
                
                # Get prediction
                index, confidence = self.predict_gesture(img_white)
                
                # Apply smoothing
                smoothed_index, smoothed_confidence = self.smooth_prediction(index, confidence)
                
                # Only update if confidence is high enough
                if smoothed_confidence >= MIN_CONFIDENCE:
                    self.current_gesture = (smoothed_index, smoothed_confidence)
                    label = self.labels[smoothed_index] if smoothed_index < len(self.labels) else "Unknown"
                    
                    # Display results
                    cv2.putText(img_output, f"{label} ({smoothed_confidence:.2f})", 
                                (x, y - 26), cv2.FONT_HERSHEY_COMPLEX, 1.0, (255, 0, 255), 2)
                    cv2.rectangle(img_output, (x-OFFSET, y-OFFSET),
                                (x+w+OFFSET, y+h+OFFSET), (255, 0, 255), 4)
                
                # Print debug info periodically
                if time.time() - self.last_prediction_time > 1.0:
                    print(f"Predicted: {label} (Confidence: {smoothed_confidence:.2f})")
                    self.last_prediction_time = time.time()
                    
            except Exception as e:
                print(f"Image processing error: {e}")
        
        return img_output
    
    def run(self):
        """Main loop for gesture recognition"""
        while True:
            img_output = self.process_frame()
            if img_output is None:
                break
            
            cv2.imshow("Hand Gesture Control", img_output)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        self.cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    recognizer = GestureRecognizer()
    recognizer.run()