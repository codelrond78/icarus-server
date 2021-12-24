import pycouchdb

server = pycouchdb.Server("http://admin:123@couchdb:5984/")
map_func = "function(doc) { emit({doc.name, doc.containers}, 1); }"
db = server.database("workspaces")

result = list(map(lambda x: x, db.query("testing/all_workspaces")))

print(result)
