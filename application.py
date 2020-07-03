import os

from flask import Flask, render_template, session, request, redirect
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret"
socketio = SocketIO(app)

users = []
channels = []
user_channels = {} # {liverishabh:[general, study], livereeti:[general]}

@app.route("/")
def index():
    return render_template("index.html")

@socketio.on("login")
def login(username):
    
    if username in users:
        emit("alert", f"Username {username} already exists!")
    else:
        users.append(username)
        emit("login", username)

@socketio.on("create channel")
def createchannel(channelname):    
    channels.append(channelname)
    emit("channel created", channelname, broadcast=True)

@socketio.on("join channel")
def joinchannel(channelname, username):
    
    if username not in user_channels.keys():
        user_channels[username]=[]   
    
    if channelname not in user_channels[username]:
        user_channels[username].append(channelname)

    emit("channel joined", channelname)


    
    
