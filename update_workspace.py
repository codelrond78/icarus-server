map_func = "function(doc) { emit({doc.name, doc.containers}, 1); }"

def update(docker_client, db, status_before):
    status = get_status(docker_client) 
    diff = get_diff_status(status_before, status)
    containers_updated = get_updated_containers(diff)
    all_workspaces = get_all_workspaces(db) 
    ws = get_workspaces_needed_to_be_updated(all_workspaces, containers_updated)
    for w in ws:
        update_workspace(w, docker_client, db) 
    return status

def get_all_workspaces(db):
    return list(db.temporary_query(map_func))

def get_workspaces_needed_to_be_updated(all_workspaces, containers_updated):
    workspaces = []
    for workspace in all_workspaces:
        for c in containers_updated:
            if workspace_contains_container(workspace, c):
                workspaces.append(workspace)
                break
    return workspaces

def workspace_contains_container(workspace, container):
    return container.startswith(workspace)

def update_workspace(workspace, docker_client, db):
    containers = get_workspace_containers(docker_client, workspace)
    doc = db.get(workspace)
    doc = db.save({"_id": workspace, 
                   "_rev": doc["_rev"], 
                   "containers": containers
                  })

def get_status(docker_client):
    containers = docker_client.containers.list()
    return list(map(
        lambda c: {"name": c.name, "status": c.status, "ports": get_ports(c.ports)}, 
        containers)
        )

def get_diff_status(status_before, status_after):
    status_before = [frozenset(x.items()) for x in status_before]
    status_after = [frozenset(x.items()) for x in status_after]

    return list(set(status_before) ^ set(status_after))

def get_updated_containers(diff):
    return list(set([dict(c)["name"] for c in diff]))

def get_ports(raw_ports):
    ports = set()
    for k, v in raw_ports.items():
        for p in v:
            ports.add(p["HostPort"])
    return tuple(ports)

def get_workspace_containers(docker_client, workspace):
    containers = []
    for c in docker_client.containers.list():
        if c.name.startswith(workspace):
            containers.append({"name": c.name, "status": c.status, "ports": get_ports(c.ports)})
    return containers