import socketio

# standard Python
sio = socketio.Client()

@sio.event
def message(data):
    print('I received a message!', data)

@sio.event
def connect():
    print("I'm connected!")

@sio.event
def connect_error(data):
    print("The connection failed!")

@sio.event
def disconnect():
    print("I'm disconnected!")

sio.connect('http://localhost:5000')
sio.emit('message', {'foo': 'bar'})
