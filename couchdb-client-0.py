import pycouchdb

server = pycouchdb.Server("http://admin:123@couchdb:5984/")
#map_func = "function(doc) { emit({doc.name, doc.containers}, 1); }"
db = server.database("workspaces")

result = list(map(lambda x: x, db.query("example/viewMyWorkspaces")))

print(result)

"""
{
  "_id": "_design/example",
  "_rev": "3-2261e8e8c89581f9fb2d385cb726e9c9",
  "filters": {
    "myWorkspaces": "function(doc, req){ if(doc.type === 'workspace'){return true}else{ return false}}"
  },
  "views": {
    "viewMyWorkspaces": {
      "map": "function(doc) { if(doc.type === 'workspace') emit(doc.name, doc); }"
    }
  }
}
"""