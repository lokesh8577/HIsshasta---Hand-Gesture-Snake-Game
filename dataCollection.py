import cv2
import numpy as np
import math
from cvzone.HandTrackingModule import HandDetector
import time

# Custom Hand Detector class with color customization
class CustomHandDetector(HandDetector):
    def __init__(self, staticMode=False, maxHands=2, modelComplexity=1, detectionCon=0.5, minTrackCon=0.5,
                 landmark_color=(0, 0, 255), connection_color=(0, 140, 255), bbox_color=(0, 0, 0)):
        super().__init__(staticMode, maxHands, modelComplexity, detectionCon, minTrackCon)
        self.landmark_color = landmark_color
        self.connection_color = connection_color
        self.bbox_color = bbox_color
    
    def findHands(self, img, draw=True, flipType=True):
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        self.results = self.hands.process(imgRGB)
        allHands = []
        h, w, c = img.shape
        
        if self.results.multi_hand_landmarks:
            for handType, handLms in zip(self.results.multi_handedness, self.results.multi_hand_landmarks):
                myHand = {}
                mylmList = []
                xList = []
                yList = []
                for id, lm in enumerate(handLms.landmark):
                    px, py, pz = int(lm.x * w), int(lm.y * h), int(lm.z * w)
                    mylmList.append([px, py, pz])
                    xList.append(px)
                    yList.append(py)
                
                # Bounding Box
                xmin, xmax = min(xList), max(xList)
                ymin, ymax = min(yList), max(yList)
                boxW, boxH = xmax - xmin, ymax - ymin
                bbox = xmin, ymin, boxW, boxH
                cx, cy = bbox[0] + (bbox[2] // 2), bbox[1] + (bbox[3] // 2)
                
                myHand["lmList"] = mylmList
                myHand["bbox"] = bbox
                myHand["center"] = (cx, cy)
                
                if flipType:
                    if handType.classification[0].label == "Right":
                        myHand["type"] = "Left"
                    else:
                        myHand["type"] = "Right"
                else:
                    myHand["type"] = handType.classification[0].label
                
                allHands.append(myHand)
                
                # Draw landmarks and connections
                if draw:
                    self.mpDraw.draw_landmarks(img, handLms, self.mpHands.HAND_CONNECTIONS,
                                               landmark_drawing_spec=self.mpDraw.DrawingSpec(
                                                   color=self.landmark_color, thickness=2, circle_radius=2),
                                               connection_drawing_spec=self.mpDraw.DrawingSpec(
                                                   color=self.connection_color, thickness=2))
                    
                    # Draw bounding box with custom color
                    cv2.rectangle(img, (bbox[0] - 20, bbox[1] - 20),
                                 (bbox[0] + bbox[2] + 20, bbox[1] + bbox[3] + 20),
                                 self.bbox_color, 2)
                    
                    # Draw hand type label
                    cv2.putText(img, myHand["type"], (bbox[0] - 30, bbox[1] - 30), cv2.FONT_HERSHEY_PLAIN,
                                2, self.bbox_color, 2)
        
        if draw:
            return allHands, img
        else:
            return allHands, imgRGB

# Initialize the custom detector with your preferred colors
# Using your specified colors:
# CIRCLE_COLOR = (0, 0, 255)      # Red circles (landmarks)
# LINE_COLOR = (0, 140, 255)      # Deep gold lines (connections)
# RECTANGLE_COLOR = (0, 0, 0)     # Black rectangle (bounding box)
detector = CustomHandDetector(
    maxHands=1,
    landmark_color=(0, 0, 255),      # Red circles
    connection_color=(0, 140, 255),  # Deep gold lines
    bbox_color=(0, 0, 0)             # Black rectangle
)

cap = cv2.VideoCapture(0)
imgSize = 300
counter = 0
offset = 20

folder = "Data/Right"

while True:
    success, img = cap.read()
    img = cv2.flip(img, 1)
    hands, img = detector.findHands(img)
    
    if hands:
        hand = hands[0]
        x, y, w, h = hand['bbox']

        imgWhite = np.ones((imgSize, imgSize, 3), np.uint8) * 255

        # Calculate crop coordinates with boundary checks
        y1, y2 = max(0, y - offset), min(img.shape[0], y + h + offset)
        x1, x2 = max(0, x - offset), min(img.shape[1], x + w + offset)
        
        imgCrop = img[y1:y2, x1:x2]
        
        # Only proceed if the crop area is valid
        if imgCrop.shape[0] > 0 and imgCrop.shape[1] > 0:
            aspectRatio = h / w
            
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

            cv2.imshow("ImageCrop", imgCrop)
            cv2.imshow("ImageWhite", imgWhite)
    
    cv2.imshow("Image", img)
    key = cv2.waitKey(1)
    if key == ord("s"):
        counter += 1
        cv2.imwrite(f'{folder}/Image_{time.time()}.jpg', imgWhite)
        print(counter)
    elif key == ord("q"):  # Press 'q' to quit
        break

cap.release()
cv2.destroyAllWindows()