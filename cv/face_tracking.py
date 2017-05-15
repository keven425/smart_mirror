# A simple native messaging host. Shows a Tkinter dialog with incoming messages
# that also allows to send message back to the webapp.
import cv2
import sys
import atexit

CASC_PATH = '/usr/local/opt/opencv/share/OpenCV/haarcascades/haarcascade_frontalface_default.xml'

class FaceTracking(object):
    
    def __init__(self):
        self.video_capture = cv2.VideoCapture(0)
        self.face_cascade = cv2.CascadeClassifier(CASC_PATH)
        atexit.register(self._cleanup)

    def detect_faces(self):
        # Capture frame-by-frame
        ret, frame = self.video_capture.read()

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.3,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.cv.CV_HAAR_SCALE_IMAGE
        )

        # Draw a rectangle around the faces
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

        # Display the resulting frame
        cv2.imshow('Video', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            exit(0)

        # if face detected
        if (hasattr(faces, 'shape')):
            return True

        return False
    
    def _cleanup(self):
        print('cleaning up')
        # When everything is done, release the capture
        self.video_capture.release()
        cv2.destroyAllWindows()

if __name__ == '__main__':
    face_tracking = FaceTracking()
    while True:
        face_tracking.detect_faces()
