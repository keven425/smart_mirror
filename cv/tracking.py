# code adopted from here:
# https://realpython.com/blog/python/face-detection-in-python-using-a-webcam/

import os
import cv2
import sys
import atexit
import environment
import numpy as np

if not environment.is_mac(): # raspberry pi
    from picamera.array import PiRGBArray
    from picamera import PiCamera
    from camera import PiVideoStream

dir = os.path.dirname(__file__)
CASC_DIR = os.path.join(dir, 'cascades')
FACE_CASC_PATH = os.path.join(CASC_DIR, 'haarcascade_frontalface_default.xml')
SMILE_CASC_PATH = os.path.join(CASC_DIR, 'haarcascade_smile.xml')
# HAND_CASC_PATH = '/Users/Keven/Downloads/fist2.xml'
# HAND_CASC_PATH = '/Users/Keven/Downloads/hand4.xml'

class Tracking(object):
    
    def __init__(self):
        if environment.is_mac():
            self.video_capture = cv2.VideoCapture(0)
        else: # raspberry pi
            self.video_stream = PiVideoStream().start()
        self.face_cascade = cv2.CascadeClassifier(FACE_CASC_PATH)
        self.smile_cascade = cv2.CascadeClassifier(SMILE_CASC_PATH)
        # self.hand_cascade = cv2.CascadeClassifier(HAND_CASC_PATH)
        self._detect_face = False
        self._detect_smile = False
        atexit.register(self._cleanup)

    def detect_face(self, should):
        self._detect_face = should

    def detect_smile(self, should):
        self._detect_smile = should

    def detect(self):
        if not self._detect_face and self._detect_smile:
            raise "in order to detect smile, must detect face"

        _return = {}
        _return['face'] = False
        _return['smile'] = False

        # Capture frame-by-frame
        if environment.is_mac():
            _, frame = self.video_capture.read()
        else: # raspberry pi
            frame = self.video_stream.read()

        if frame is None:
            return _return # camera might not be ready yet

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # hands = self.hand_cascade.detectMultiScale(
        #     gray,
        #     scaleFactor=1.3,
        #     minNeighbors=5,
        #     minSize=(30, 30),
        #     flags=cv2.CASCADE_SCALE_IMAGE
        # )
        #
        # # Draw a rectangle around the faces
        # for (x, y, w, h) in hands:
        #     cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

        if self._detect_face:
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.3,
                minNeighbors=5,
                minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE
            )

            # Draw a rectangle around the faces
            for (x, y, w, h) in faces:
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

            # if face detected
            face_detected = hasattr(faces, 'shape')
            _return['face'] = face_detected

            if face_detected and self._detect_smile:
                # detect smile
                # pick largest face
                faces_area = faces[:, 2] * faces[:, 3]
                face = faces[np.argmax(faces_area)]

                # find smile within face
                x, y, w, h = face
                roi_gray = gray[y:y + h, x:x + w]
                roi_color = frame[y:y + h, x:x + w]

                smiles = self.smile_cascade.detectMultiScale(
                    roi_gray,
                    scaleFactor=1.2,
                    minNeighbors=22,
                    minSize=(15, 15),
                    maxSize=(80, 80),
                    flags=cv2.CASCADE_SCALE_IMAGE
                )

                # Set region of interest for smiles
                for (x, y, w, h) in smiles:
                    cv2.rectangle(roi_color, (x, y), (x + w, y + h), (0, 0, 255), 3)

                # if smile detected
                _return['smile'] = hasattr(smiles, 'shape')

        # Display the resulting frame
        cv2.imshow('Video', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            exit(0)

        return _return

    def _cleanup(self):
        print('cleaning up')
        # When everything is done, release the capture
        if environment.is_mac():
            self.video_capture.release()
        else: # raspberry pi
            self.video_stream.stop()
        cv2.destroyAllWindows()

if __name__ == '__main__':
    tracking = Tracking()
    tracking.detect_face(True)
    tracking.detect_smile(True)
    try:
        while True:
            tracking.detect()
    except KeyboardInterrupt:
        tracking._cleanup()
        sys.exit(0)

