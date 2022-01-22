const PouchDB = require('pouchdb');

const password = '123';
const remoteWorkspaces = new PouchDB(`http://admin:${password}@couchdb:5984/workspaces`)

async function f(){
    try{
        let doc = await remoteWorkspaces.get('_design/testing')
        console.log(doc)
        remoteWorkspaces.remove(doc)    
    }catch(err){
        console.log(err)
    }    
}

f()