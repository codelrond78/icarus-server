import pycouchdb
server = pycouchdb.Server("http://admin:123@couchdb:5984/")

print(server.info()['version'])