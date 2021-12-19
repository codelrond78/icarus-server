from flask import Flask, render_template
from flask_socketio import SocketIO, send

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route("/")
def hello_world():
    #send('hola ;)')
    return "<p>Hello, World!</p>"

@socketio.on('message')
def handle_json(msg):
    print('received message: ' + str(msg))
    send(str(msg))

@socketio.on('connect')
def test_connect():
    print('connect!')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0')