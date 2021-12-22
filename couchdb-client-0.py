import pycouchdb
server = pycouchdb.Server("http://admin:123@couchdb:5984/")

#db = server.create("foo2")
db = server.database("foo2")

#doc = db.save({"name": "bar"})

"""
_doc = {
    "_id": "_design/testing",
    "views": {
        "names": {
            "map": "function(doc) { emit(doc, 1); }",
            "reduce": "function(k, v) { return  sum(v); }",
        }
    }
}

db.save(_doc)
"""

result = list(db.query("testing/names", group='true'))
print(result)
#print(server.info()['version'])
#