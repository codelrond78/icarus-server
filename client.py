import socketio

# standard Python
sio = socketio.Client()

@sio.event
def status(data):
    print('status --> ', data)

@sio.event
def log(data):
    print('log --> ', data)

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
#sio.emit('message', {'foo': 'bar'})
