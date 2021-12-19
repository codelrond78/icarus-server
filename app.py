from flask import Flask, render_template
from flask_socketio import SocketIO, send
import docker

client = docker.from_env()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@socketio.on('message')
def handle_json(msg):
    print('received message: ' + str(msg))
    container = client.containers.run("ubuntu", "echo hello world", detach=True)
    #container = client.containers.run("hello-world", detach=True)
    for line in container.logs(stream=True):
        send(line.strip())
    send('fin!')

@socketio.on('connect')
def test_connect():
    print('connect!')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0')