#! /usr/bin/env python
"""
Demo Flask application to test the operation of Flask with socket.io

Aim is to create a webpage that is constantly updated with random numbers from a background python process.

30th May 2014

===================

Updated 13th April 2018

+ Upgraded code to Python 3
+ Used Python3 SocketIO implementation
+ Updated CDN Javascript and CSS sources

"""

# Start with a basic flask app webpage.
from flask_socketio import SocketIO, emit
from flask import Flask, render_template, url_for, copy_current_request_context
from flask_cors import CORS
from random import random
from time import sleep
from threading import Thread, Event

from sklearn.neighbors import NearestNeighbors

import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'facenet', 'contributed'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'facenet', 'src'))
import face
import facenet

import time
import pickle
import requests

import cv2
import numpy as np

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
app.config['DEBUG'] = True

#turn the flask app into a socketio app
socketio = SocketIO(app)

#random number Generator Thread
thread = Thread()
threadStopEvent = Event()

images = np.load(os.path.join(os.path.dirname(__file__),'static','images','label_strings.npy'))
embeddings = np.load(os.path.join(os.path.dirname(__file__),'static','images', 'embeddings.npy')).astype(np.float32)
social_credit = np.random.random(images.shape)
# with open('tree.pkl', 'rb') as f:
#     tree = pickle.load(f)
tree = NearestNeighbors(metric='cosine', leaf_size=10, algorithm='auto')
tree.fit(embeddings)

def rounded_rectangle(src, topLeft, bottomRight, lineColor, thickness, lineType, radius):
    # corners:
    # p1 - p2
    # |     |
    # p4 - p3
    # 
    p1 = topLeft;
    p2 =(bottomRight[0], topLeft[1]);
    p3 = bottomRight;
    p4 = (topLeft[0], bottomRight[1]);

    # draw straight lines
    src = cv2.line(src, (p1[0] + radius, p1[1]), (p2[0] - radius, p2[1]), lineColor, thickness, lineType);
    src = cv2.line(src, (p2[0], p2[1] + radius), (p3[0], p3[1] - radius), lineColor, thickness, lineType);
    src = cv2.line(src, (p4[0] + radius, p4[1]), (p3[0] - radius, p3[1]), lineColor, thickness, lineType);
    src = cv2.line(src, (p1[0], p1[1] + radius), (p4[0], p4[1] - radius), lineColor, thickness, lineType);

    # draw arcs
    src = cv2.ellipse( src, (p1[0] + radius, p1[1] + radius), ( radius, radius ), 180.0, 0, 90, lineColor, thickness, lineType );
    src = cv2.ellipse( src, (p2[0] - radius, p2[1] + radius), ( radius, radius ), 270.0, 0, 90, lineColor, thickness, lineType );
    src = cv2.ellipse( src, (p3[0] - radius, p3[1] - radius), ( radius, radius ), 0.0, 0, 90, lineColor, thickness, lineType );
    src = cv2.ellipse( src, (p4[0] + radius, p4[1] - radius), ( radius, radius ), 90.0, 0, 90, lineColor, thickness, lineType );
    return src

def add_overlays(frame, faces, frame_rate):
    if faces is not None:
        for face in faces:
            face_bb = face.bounding_box.astype(int)
            frame = rounded_rectangle(frame,
                                      (face_bb[0], face_bb[1]), (face_bb[2], face_bb[3]),
                                      (186,114,16), 2, 8, 5)
            break
    return frame

def crop_square(img, size = None):
    h, w = img.shape[0], img.shape[1]
    min_size = min(h, w)
    offsets = [(h - min_size) // 2, (w - min_size) // 2]
    img_cropped = img[offsets[0]:h-offsets[0], offsets[1]:w - offsets[1]]
    if size is not None:
        img_cropped = cv2.resize(img_cropped, (size, size))
    return img_cropped

class VideoThread(Thread):
    def __init__(self):
        self.delay = 1/30
        self.lastFrame = crop_square(cv2.imread(os.path.join('static', 'images', 'user.jpg')), 500)
        self.captured = False
        self.lastEmbeddings = []
        self.search = False
        super(VideoThread, self).__init__()

    def getVideoStream(self):
        frame_interval = 2  # Number of frames after which to run face detection
        frame_rate = 0
        frame_count = 30
        print("Getting video stream")
        # video_capture = cv2.VideoCapture(os.path.join(os.path.dirname(__file__),'static','defaults','face.webm'))
        # video_capture.set(cv2.CAP_PROP_POS_FRAMES, frame_count)
        video_capture = cv2.VideoCapture(0, apiPreference=cv2.CAP_DSHOW) 
        video_capture.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        video_capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        print("Setting up facial recognition")
        face_recognition = face.Recognition()
        # face_recognition = None
        start_time = time.time()
        while not threadStopEvent.isSet():
            frame_count += 1
            # if frame_count == video_capture.get(cv2.CAP_PROP_FRAME_COUNT):
            #     frame_count = 30 #Or whatever as long as it is the same as next line
            #     video_capture.set(cv2.CAP_PROP_POS_FRAMES, frame_count)
            # Capture frame-by-frame
            ret, frame = video_capture.read()

            if self.captured or not ret:
                # if not ret:
                #     print("Resetting camera")
                #     video_capture = cv2.VideoCapture(0, cv2.CAP_WINRT)
                continue

            # frame = cv2.resize(frame,(800,448))
            frame = crop_square(frame, 500)
            ret, buf = cv2.imencode('.jpg', frame)
            socketio.emit('image', { 'image': True, 'buffer': buf.tobytes() },namespace='/test');
            if face_recognition is not None:
                faces = face_recognition.identify(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                if faces is None:
                    self.lastEmbeddings.clear()
                elif len(faces) > 0:
                    self.lastEmbeddings.append(faces[0].embedding)
                    if len(self.lastEmbeddings) > 10:
                        self.lastEmbeddings.pop(0)
                else:
                    self.lastEmbeddings.clear()
                add_overlays(frame, faces, frame_rate)
                if self.search and len(self.lastEmbeddings) > 0 and frame_count % frame_interval == 0:
                    mean_embedding = np.mean(self.lastEmbeddings, axis=0)
                    distances, best_matches = tree.kneighbors(mean_embedding.reshape(1,-1), n_neighbors=6)
                    socketio.emit('searchResult', { 'A': 'static/images/' + images[int(best_matches[0,0])].replace('\\','/'),
                                                    'B': 'static/images/' + images[int(best_matches[0,1])].replace('\\','/'),
                                                    'C': 'static/images/' + images[int(best_matches[0,2])].replace('\\','/'),
                                                    'D': 'static/images/' + images[int(best_matches[0,3])].replace('\\','/'),
                                                    'E': 'static/images/' + images[int(best_matches[0,4])].replace('\\','/'),
                                                    'F': 'static/images/' + images[int(best_matches[0,5])].replace('\\','/'),
                                                    'Adist': str(distances[0,0]),
                                                    'Bdist': str(distances[0,1]),
                                                    'Cdist': str(distances[0,2]),
                                                    'Ddist': str(distances[0,3]),
                                                    'Edist': str(distances[0,4]),
                                                    'Fdist': str(distances[0,5]),
                                                    'Acred': str(social_credit[int(best_matches[0,0])]),
                                                    'Bcred': str(social_credit[int(best_matches[0,1])]),
                                                    'Ccred': str(social_credit[int(best_matches[0,2])]),
                                                    'Dcred': str(social_credit[int(best_matches[0,3])]),
                                                    'Ecred': str(social_credit[int(best_matches[0,4])]),
                                                    'Fcred': str(social_credit[int(best_matches[0,5])]),
                                                    'image': buf.tobytes()},namespace='/test');

            # if frame_count > 10:
            #     break
    def run(self):
        self.getVideoStream()

@app.route('/companion')
def companion():
    return render_template('CompanionsAdminPanel.html')

@app.route('/')
def index():
    #only by sending this page first will the client be connected to the socketio instance
    return render_template('landing.html')

@app.route('/verify')
def verify():
    #only by sending this page first will the client be connected to the socketio instance
    return render_template('verification.html')

@app.route('/globe')
def globe():
    #only by sending this page first will the client be connected to the socketio instance
    return render_template('globe.html')

@socketio.on('search', namespace='/test')
def search(msg):
    thread.search = True

@socketio.on('stop_search', namespace='/test')
def stop_search(msg):
    thread.search = False

@socketio.on('get_user_data', namespace='/test')
def get_user_data(msg):
    r = requests.get('https://projectamelia.ai/pusherman/social_calculator?token=' + msg['token'])
    print(r.status_code)
    if r.status_code == 200:
        socketio.emit('user_data', { 'json': r.text },namespace='/test');
    else:
        print("GOT ERROR CODE WHEN REQUESTING DATA", r.status_code)
        socketio.emit('user_data', { 'json': '{"name": "", \
                                               "email": "", \
                                               "locations": [], \
                                               "flights": [], \
                                               "payments": [], \
                                               "venmo_snippets": [], \
                                               "squarecash_snippets": []}'},namespace='/test');


@socketio.on('connect', namespace='/test')
def test_connect():
    # need visibility of the global thread object
    global thread
    print('Client connected')

    #Start the random number generator thread only if the thread has not been started before.
    if not thread.isAlive():
        print("Starting Thread")
        thread = VideoThread()
        thread.start()

@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    socketio.run(app)
