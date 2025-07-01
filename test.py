# import cv2
# import numpy as np
# import math
# from cvzone.HandTrackingModule import HandDetector
# import time
# import tensorflow as tf
#
# # Initialize video capture
# cap = cv2.VideoCapture(0)
# detector = HandDetector(maxHands=1)
#
# # Custom model loading to handle compatibility
# try:
#     # Try loading with Keras' modern API first
#     model = tf.keras.models.load_model("Model_2/keras_model.h5")
# except Exception as e:
#     print(f"Standard loading failed: {e}")
#     try:
#         # Try loading with legacy support
#         model = tf.keras.models.load_model(
#             "Model_2/keras_model.h5",
#             custom_objects={'DepthwiseConv2D': tf.keras.layers.DepthwiseConv2D}
#         )
#     except Exception as e:
#         print(f"Legacy loading failed: {e}")
#         raise
#
# # Read labels
# with open("Model_2/labels.txt", "r") as f:
#     labels = [line.strip() for line in f.readlines()]
#
# imgSize = 300
# offset = 20
#
#
# def get_prediction(img):
#     img = cv2.resize(img, (224, 224))  # Adjust based on your model's expected input
#     img = np.expand_dims(img, axis=0)
#     img = img / 255.0  # Normalize if your model expects this
#     predictions = model.predict(img)
#     index = np.argmax(predictions)
#     confidence = predictions[0][index]
#     return index, confidence
#
#
# while True:
#     success, img = cap.read()
#     if not success:
#         break
#
#     img = cv2.flip(img, 1)
#     imgOutput = img.copy()
#     hands, img = detector.findHands(img)
#
#     if hands:
#         hand = hands[0]
#         x, y, w, h = hand['bbox']
#
#         imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255
#         imgCrop = img[y - offset:y + h + offset, x - offset:x + w + offset]
#
#         aspectRatio = h / w
#
#         try:
#             if aspectRatio > 1:
#                 k = imgSize / h
#                 wCal = math.ceil(k * w)
#                 imgResize = cv2.resize(imgCrop, (wCal, imgSize))
#                 wGap = math.ceil((imgSize - wCal) / 2)
#                 imgWhite[:, wGap:wCal + wGap] = imgResize
#             else:
#                 k = imgSize / w
#                 hCal = math.ceil(k * h)
#                 imgResize = cv2.resize(imgCrop, (imgSize, hCal))
#                 hGap = math.ceil((imgSize - hCal) / 2)
#                 imgWhite[hGap:hCal + hGap, :] = imgResize
#
#             index, confidence = get_prediction(imgWhite)
#             print(f"Predicted: {labels[index]} with confidence {confidence:.2f}")
#             cv2.putText(imgOutput, labels[index], (x, y - 26),
#                         cv2.FONT_HERSHEY_COMPLEX, 1.7, (255, 0, 255), 2)
#             cv2.rectangle(imgOutput, (x - offset, y - offset),
#                           (x + w + offset, y + h + offset), (255, 0, 255), 4)
#         except Exception as e:
#             print(f"Processing error: {e}")
#
#     cv2.imshow("Image", imgOutput)
#     if cv2.waitKey(1) & 0xFF == ord('q'):
#         break
#
# cap.release()
# cv2.destroyAllWindows()


import cv2
import numpy as np
import math
from cvzone.HandTrackingModule import HandDetector
import tensorflow as tf
from tensorflow.keras.layers import DepthwiseConv2D
import time


# Custom DepthwiseConv2D class to handle legacy models
class CompatibleDepthwiseConv2D(DepthwiseConv2D):
    def __init__(self, *args, **kwargs):
        # Remove 'groups' parameter if present (legacy models)
        kwargs.pop('groups', None)
        super().__init__(*args, **kwargs)


# Initialize video capture
cap = cv2.VideoCapture(0)
detector = HandDetector(maxHands=1)

# Load model with custom objects
try:
    model = tf.keras.models.load_model(
        "Model/keras_model.h5",
        custom_objects={'DepthwiseConv2D': CompatibleDepthwiseConv2D}
    )
except Exception as e:
    print(f"Model loading failed: {e}")
    # Fallback to TensorFlow Lite if available
    try:
        interpreter = tf.lite.Interpreter(model_path="Model/converted_model.tflite")
        interpreter.allocate_tensors()
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        model_type = 'tflite'
    except:
        raise RuntimeError("Could not load either H5 or TFLite model")

# Read labels
with open("Model/labels.txt", "r") as f:
    labels = [line.strip() for line in f.readlines()]

imgSize = 300
offset = 20


def get_prediction(img):
    if 'model_type' in globals() and model_type == 'tflite':
        # TFLite inference
        img = cv2.resize(img, (224, 224)).astype(np.float32)
        img = np.expand_dims(img, axis=0)
        interpreter.set_tensor(input_details[0]['index'], img)
        interpreter.invoke()
        predictions = interpreter.get_tensor(output_details[0]['index'])
    else:
        # Standard Keras inference
        img = cv2.resize(img, (224, 224))
        img = np.expand_dims(img, axis=0)
        img = img / 255.0
        predictions = model.predict(img)

    index = np.argmax(predictions)
    confidence = predictions[0][index]
    return index, confidence


while True:
    success, img = cap.read()
    if not success:
        break

    img = cv2.flip(img, 1)
    imgOutput = img.copy()
    hands, img = detector.findHands(img)

    if hands:
        hand = hands[0]
        x, y, w, h = hand['bbox']

        imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255
        imgCrop = img[y - offset:y + h + offset, x - offset:x + w + offset]

        aspectRatio = h / w

        try:
            if aspectRatio > 1:
                k = imgSize / h
                wCal = math.ceil(k * w)
                imgResize = cv2.resize(imgCrop, (wCal, imgSize))
                wGap = math.ceil((imgSize - wCal) / 2)
                imgWhite[:, wGap:wCal + wGap] = imgResize
            else:
                k = imgSize / w
                hCal = math.ceil(k * h)
                imgResize = cv2.resize(imgCrop, (imgSize, hCal))
                hGap = math.ceil((imgSize - hCal) / 2)
                imgWhite[hGap:hCal + hGap, :] = imgResize

            index, confidence = get_prediction(imgWhite)
            print(f"Predicted: {labels[index]} (Confidence: {confidence:.2f})")
            cv2.putText(imgOutput, labels[index], (x, y - 26),
                        cv2.FONT_HERSHEY_COMPLEX, 1.7, (255, 0, 255), 2)
            cv2.rectangle(imgOutput, (x - offset, y - offset),
                          (x + w + offset, y + h + offset), (255, 0, 255), 4)
        except Exception as e:
            print(f"Processing error: {e}")

    cv2.imshow("Hand Gesture Control", imgOutput)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()