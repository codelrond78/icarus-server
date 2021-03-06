//const PouchDB = require('pouchdb');
const {Docker} = require('node-docker-api');

const docker = new Docker({ socketPath: '/var/run/docker.sock' })

function getPorts(raw){
    let ports = new Set();
    
    for (let [key, value] of Object.entries(raw)) {
        if(value !== null){
            for(let port of value){
                ports.add(key + ':' + port.HostPort)
            }
        }
    }
    return Array.from(ports);
}

async function updateWorkspaceFromContainer(status, name, ports, db){
    let workspaces = await db.allDocs({
        include_docs: true
    });
    workspaces = workspaces.rows;
    
    if(name.startsWith("/")){
        name = name.substring(1)
    }

    for(let workspace of workspaces){        
        if(name.startsWith(workspace.id)){
            let containers = workspace.doc.containers.filter(function(c){ 
                return c.name != name;
            });
            if(status === 'destroy'){
                //
            }else{
                containers = [...containers, {name, status, ports}];
            } 

            db.put(
                {...workspace.doc, containers}
            );
            break;
        }
    }    
}

const promisifyStream = (stream, workspacesDB) => new Promise((resolve, reject) => {
    stream.on('data', async data => {
        try{
            let json = JSON.parse(data.toString());        
            let status = json.status;
            let name = json.Actor.Attributes.name;

            if(json.status === 'destroy'){    
                await updateWorkspaceFromContainer(status, name, null, workspacesDB)
                console.log({
                    status,
                    name
                });
            }
            else if(json.status === 'start'){ 
                let container = await docker.container.get(json.id).status();
                
                const ports = getPorts(container.data.NetworkSettings.Ports);
                await updateWorkspaceFromContainer(container.data.State.Status, name, ports, workspacesDB)
                console.log({
                    status: container.data.State.Status,
                    name: container.data.Name,
                    ports
                })
            }        
        }catch(err){
            console.log(err);
        }
    })
    stream.on('end', resolve)
    stream.on('error', reject)
})

function dockerListener(workspacesDB){
    console.log('start docker event listener...');
    docker.events({
        since: ((new Date().getTime() / 1000) - 60).toFixed(0)
    })
      .then(stream => promisifyStream(stream, workspacesDB))
      .catch(error => console.log(error))
}

module.exports = {
    dockerListener
}
