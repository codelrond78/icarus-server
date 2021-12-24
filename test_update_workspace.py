from unittest.mock import MagicMock
from update_workspace import update, get_diff_status, get_updated_containers, get_workspaces_needed_to_be_updated

class Container:
    def __init__(self, name, status, ports):
        self.name = name
        self.status = status
        self.ports = ports

def test_diff_empty():
    status_before = []
    status_after = []

    diff = get_diff_status(status_before, status_after) 
    assert get_updated_containers(diff) == []

def test_diff_one_is_empty():
    status_before = []
    status_after = [{'name': 'a_1', 'status': 'stopped', 'ports': ('8080',)}]

    diff = get_diff_status(status_before, status_after) 
    assert get_updated_containers(diff) == ['a_1']

def test_diff_a_1():
    status_before = [{'name': 'a_1', 'status': 'running', 'ports': ('8080',)}]
    status_after = [{'name': 'a_1', 'status': 'stopped', 'ports': ('8080',)}]

    diff = get_diff_status(status_before, status_after) 
    assert get_updated_containers(diff) == ['a_1']

def test_diff_new_container():
    status_before = [{'name': 'a_1', 'status': 'running', 'ports': ('8080',)}]
    status_after = [{'name': 'a_1', 'status': 'running', 'ports': ('8080',)}, 
                    {'name': 'b_1', 'status': 'running', 'ports': ('3000',)}
    ]

    diff = get_diff_status(status_before, status_after) 
    assert get_updated_containers(diff) == ['b_1']

def test_diff_one_is_deleted():
    status_before = [{'name': 'a_1', 'status': 'running', 'ports': ('8080',)}]
    status_after = []

    diff = get_diff_status(status_before, status_after) 
    assert get_updated_containers(diff) == ['a_1']

def test_ws_needed_to_be_update():
    workspaces = ['a', 'b']
    containers = ['a_1']
    assert get_workspaces_needed_to_be_updated(workspaces, containers) == ['a']

def test_ws_needed_to_be_updated_empty():
    workspaces = []
    containers = []
    assert get_workspaces_needed_to_be_updated(workspaces, containers) == []

def test_ws_needed_to_be_updated_empty_2():
    workspaces = ['a']
    containers = []
    assert get_workspaces_needed_to_be_updated(workspaces, containers) == []

def test_not_called():
    status_before = [{'name': 'a_1', 'status': 'running', 'ports': ('8080',)}]
    db = MagicMock()
    db.temporary_query.return_value = ['a']
    db.get.return_value = {
                           "_rev": "_123",                            
                          }

    containers = [Container('a_1', 'running', {'-': [{"HostPort": "8080"}]})]
    
    docker_client = MagicMock()
    docker_client.containers.list.return_value = containers

    update(docker_client, db, status_before)

    db.save.assert_not_called    

def test_called():
    status_before = [{'name': 'a_1', 'status': 'stopped', 'ports': ('8080',)}, {'name': 'a_2', 'status': 'running', 'ports': ('3000',)}]
    db = MagicMock()
    db.temporary_query.return_value = ['a']
    db.get.return_value = {
                           "_rev": "_123",                            
                          }

    containers = [Container('a_1', 'running', {'-': [{"HostPort": "8080"}]}),
                  Container('a_2', 'running', {'-': [{"HostPort": "3000"}]}),
    ]
    
    docker_client = MagicMock()
    docker_client.containers.list.return_value = containers

    update(docker_client, db, status_before)

    db.save.assert_called_with({"_id": 'a', 
                                "_rev": "_123", 
                                "containers": [{'name': 'a_1', 'status': 'running', 'ports': ('8080',)}, 
                                               {'name': 'a_2', 'status': 'running', 'ports': ('3000',)}
                                              ]
                                })

    