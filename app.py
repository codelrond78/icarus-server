from flask import Flask, request
from flask_socketio import SocketIO #, send
import docker
import os
from subprocess import Popen, PIPE, STDOUT

client = docker.from_env()

WORKSPACES_PATH = '/workspaces'

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

def log_subprocess_output(pipe):
    for line in iter(pipe.readline, b''): # b'\n'-separated lines
        print(line)

def run(command):
    process = Popen(command, stdout=PIPE, stderr=STDOUT)
    with process.stdout:
        log_subprocess_output(process.stdout)
    exitcode = process.wait() # 0 means success

def workspaces():
    containers = client.containers.list()
    workspaces_folders = os.list(WORKSPACES_PATH)
    #cocinar respuesta con la lista de folders añadiendo el status del contenedor a cada contenedor del workspace
    return []

def post_workspace(name, data):
    path = os.path.join(WORKSPACES_PATH, name) 
    os.mkdir(path)
    with open(os.path.join(path, 'docker-compose.yaml'), 'w') as fout:
        fout.write(data.decode("utf-8"))
    return 'ok'

@app.route("/")
def hello_world():
    return ";)"

@app.route('/api/workspaces', methods=['GET'])
def get_workspaces():
    return get_workspaces()

@app.route('/api/workspaces/<name>', methods=['POST'])
def post_workspace_handler(name):
    return post_workspace(name, request.data)

@app.route('/api/workspace/<name>', methods=['GET', 'PUT', 'DELETE'])
def handle_workspace(name):
    if request.method == 'GET':
        pass
    elif request.method == 'PUT':
        pass
    elif request.method == 'DELETE':
        pass

@app.route('/api/workspace/<name>/start', methods=['PUT'])
def handle_start():
    pass

@app.route('/api/workspace/<name>/stop', methods=['PUT'])
def handle_stop():
    pass

"""
@socketio.on('message')
def handle_json(msg):
    print('received message: ' + str(msg))
    container = client.containers.run("ubuntu", "echo hello world", detach=True)
    #container = client.containers.run("hello-world", detach=True)
    for line in container.logs(stream=True):
        send(line.strip())
    send('fin!')
"""

@socketio.on('connect')
def test_connect():
    print('connect!')

def containers_status():
    while True:
        socketio.sleep(1)  
        containers = client.containers.list()
        socketio.emit('status', list(containers.map(lambda c: {"name": c.name, "status": c.status}), containers))

if __name__ == '__main__':
    #socketio.start_background_task(target=containers_status)
    socketio.run(app, host='0.0.0.0')
    #run(["ls", "-l"])