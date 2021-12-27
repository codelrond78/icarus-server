const PouchDB = require('pouchdb');
const {Docker} = require('node-docker-api');

const docker = new Docker({ socketPath: '/var/run/docker.sock' })

function getPorts(raw){
    let ports = new Set();
    for (let [key, value] of Object.entries(raw)) {
        for(let port of value){
            ports.add(port.HostPort)
        }
    }
    return Array.from(ports);
}

async function updateWorkspaceFromContainer(status, name, ports, localWorkspaces){
    let workspaces = await localWorkspaces.allDocs({
        include_docs: true
    });
    workspaces = workspaces.rows;
    
    if(name.startsWith("/")){
        name = name.substring(1)
    }

    for(let workspace of workspaces){
        console.log('match?', name, workspace.id);
        if(name.startsWith(workspace.id)){
            console.log(workspace)
            let containers = workspace.doc.containers.filter(function(c){ 
                return c.name != name;
            });
            if(status === 'destroy'){
                //
            }else{
                containers = [...containers, {name, status, ports}];
            } 
            console.log('localWorkspace.put');
            console.log({...workspace.doc, containers})
            try{
                localWorkspaces.put(
                    {...workspace.doc, containers}
                );
            }catch(err){
                console.log(err)
            }
            break;
        }
    }    
}

const promisifyStream = (stream, workspacesDB) => new Promise((resolve, reject) => {
    stream.on('data', data => {
        let json = JSON.parse(data.toString());        
        let status = json.status;
        let name = json.Actor.Attributes.name;

        //workspacesDB.allDocs().then(x=>console.log(x));
        
        //console.log('name', name)
        //console.log('status', status);

        if(json.status === 'destroy'){    
            updateWorkspaceFromContainer(status, name, null, workspacesDB)
            console.log({
                status,
                name
            });
        }
        else if(json.status === 'start'){ 
            try{
                docker.container.get(json.id).status().then(container => {
                    const ports = getPorts(container.data.NetworkSettings.Ports) 
                    updateWorkspaceFromContainer(status, name, ports, workspacesDB)
                    console.log({
                        status: container.data.State.Status,
                        name: container.data.Name,
                        ports
                    })
                });
            }catch(err){
                console.log(err)
            }
        }        
    })
    stream.on('end', resolve)
    stream.on('error', reject)
})

function f(workspacesDB){
    docker.events({
        since: ((new Date().getTime() / 1000) - 60).toFixed(0)
    })
      .then(stream => promisifyStream(stream, workspacesDB))
      .catch(error => console.log(error))
}

const localWorkspaces = new PouchDB('localWorkspaces');
const remoteWorkspaces = new PouchDB(`http://admin:123@couchdb:5984/workspaces`)

localWorkspaces.sync(remoteWorkspaces, {
    live: true,
    retry: true,
    filter: 'example/myWorkspaces',
}).on('change', function (change) {
    console.log(change)
}).on('error', function (err) {
    console.log('err en log:', err)
});

console.log('comenzamos')
f(localWorkspaces)
