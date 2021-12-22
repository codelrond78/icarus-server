from flask import Flask, request
from flask_socketio import SocketIO
import docker
import os
from subprocess import Popen, PIPE, STDOUT
from shutil import copyfile
from yaml import load
import threading
import pycouchdb
import time
import rx
from rx import operators as ops

server = pycouchdb.Server("http://admin:123@couchdb:5984/")
db = server.database("foo2")

client = docker.from_env()

WORKSPACES_PATH = '/workspaces'

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

def create_dirs_from_spec(path, document):
    document = load(document)
    
    for name in document["services"]:        
        path = os.path.join(path, name) 
        os.mkdir(path)    

def get_status():
    containers = client.containers.list()
    return list(map(
        lambda c: {"name": c.name, "status": c.status, "ports":c.ports}, 
        containers)
        )

def containers_status():    
    status_before = None
    doc = db.get("icarus-current-status")
    i = 0

    while True:
        status = get_status()
        #if status != status_before:
        #    status_before = status
        print(i)
        i += 1
        doc = db.save({"_id": "icarus-current-status", 
                           "_rev": doc["_rev"], 
                           "status": status, 
                           "time": time.time()
                           })
        time.sleep(5)

def log_subprocess_output(pipe, command):
    log = server.database("icarus_log")
    for line in iter(pipe.readline, b''): # b'\n'-separated lines
        doc = {"command": command,
               "line": line.decode("utf-8"),
               "time": time.time()}
        print('log-->', doc)
        log.save(doc)

"""
def _log_subprocess_output(pipe):
    source = rx.subject.Subject()
    subs = source.pipe(
        ops.buffer_with_time(2.0)
    )
    subs.subscribe(lambda value: socketio.emit('log', value))
    
    for line in iter(pipe.readline, b''): # b'\n'-separated lines
        print('-->',line)
        source.on_next(line)
    
    #source.dispose()
    source.on_completed()
    print('fin!!!!!!')
"""

def run(command):
    process = Popen(command, stdout=PIPE, stderr=STDOUT)
    with process.stdout:
        log_subprocess_output(process.stdout, command)
    exitcode = process.wait() # 0 means success

def workspaces():
    containers = client.containers.list()
    workspaces_folders = os.listdir(WORKSPACES_PATH)
    workspaces = {}
    for folder in workspaces_folders:
        src = os.path.join(WORKSPACES_PATH, folder, "docker-compose.yaml")
        with open(src, mode='r') as filein:
            document = filein.read()
        workspaces[folder] = {"document": document}
    #cocinar respuesta con la lista de folders añadiendo el status del contenedor a cada contenedor del workspace
    return {"workspaces": workspaces, "status": get_status()}

def create_workspace(name, data):
    path = os.path.join(WORKSPACES_PATH, name) 
    os.mkdir(path)
    with open(os.path.join(path, 'docker-compose.yaml'), 'w') as fout:
        fout.write(data)
    create_dirs_from_spec(path, data)
    return 'ok'

@app.route("/")
def hello_world():
    return ";)"

@app.route('/api/workspaces/status', methods=['GET'])
def get_workspaces_status():
    return {"status": get_status()}

@app.route('/api/workspaces', methods=['GET'])
def get_workspaces():
    return workspaces()

@app.route('/api/workspaces/<name>', methods=['POST'])
def post_workspace_handler(name):
    return create_workspace(name, request.data.decode("utf-8"))

@app.route('/api/workspace/<name>', methods=['GET', 'PUT', 'DELETE'])
def handle_workspace(name):
    if request.method == 'GET':
        pass
    elif request.method == 'PUT':
        pass
    elif request.method == 'DELETE':
        pass

@app.route('/api/workspace/<name>/start', methods=['PUT'])
def handle_start(name):
    path = os.path.join(WORKSPACES_PATH, name, "docker-compose.yaml")
    command = ["docker-compose", "-f", path, "up", "-d"]
    x = threading.Thread(target=run, args=(command,))
    x.start()
    return 'starting...'

@app.route('/api/workspace/<name>/stop', methods=['PUT'])
def handle_stop(name):
    path = os.path.join(WORKSPACES_PATH, name, "docker-compose.yaml")
    command = ["docker-compose", "-f", path, "stop"]
    x = threading.Thread(target=run, args=(command,))
    x.start()
    return 'stopping...'

@app.route('/api/workspace/<name_orig>/clone/<name_dst>', methods=['POST'])
def handle_clone(name_orig, name_dst):
    src = os.path.join(WORKSPACES_PATH, name_orig, "docker-compose.yaml")
    with open(src, mode='r') as filein:
        data = filein.read()
    create_workspace(name_dst, data)
    return 'cloned'

@socketio.on('connect')
def test_connect():
    print('connect!')
    #socketio.emit('status', get_status(), enviar solo a este cliente)

if __name__ == '__main__':
    #socketio.start_background_task(target=containers_status)
    x = threading.Thread(target=containers_status)
    x.start()
    socketio.run(app, host='0.0.0.0')