import docker

client = docker.from_env()

print(client.containers.list())

for c in client.containers.list():
    print(c.name, c.status)