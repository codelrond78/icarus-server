from unittest.mock import MagicMock
from update_workspace import update

class Container:
    def __init__(self, name, status, ports):
        self.name = name
        self.status = status
        self.ports = ports

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

    