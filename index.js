const PouchDB = require('pouchdb');

const password = '123';
const localWorkspaces = new PouchDB('localWorkspaces')
const remoteWorkspaces = new PouchDB(`http://admin:${password}@couchdb:5984/workspaces`)

localWorkspaces.sync(remoteWorkspaces, {
    live: true,
    retry: true,
filter: 'example/myWorkspaces',
}).on('change', function (change) {
    console.log(change)
}).on('error', function (err) {
    console.log('err en log:', err)
});

async function f(){
    try{
        const docs = await localWorkspaces.allDocs();
        console.log(docs);
    }catch(err){
        console.log('hay un error');
    }      
    console.log('done');
}

f();