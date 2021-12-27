const {Docker} = require('node-docker-api');

const docker = new Docker({ socketPath: '/var/run/docker.sock' })

function getPorts(raw){
    let ports = new Set();
    for (let [key, value] of Object.entries(raw)) {
        for(let port of value){
            ports.add(port.HostPort)
        }
    }
    return ports;
}

async function updateWorkspaceFromContainer(status, name, ports, localWorkspaces){
    const workspaces = await localWorkspaces.allDocs();
    
    for(let workspace of workspaces){
        if(name.startsWith(workspace._id)){
            let containers = workspace.containers.filter(function(c){ 
                return c.name != name;
            });
            if(status === 'destroy'){
                //
            }else{
                containers = [...containers, {name, status, ports}];
            }            
            localWorkspaces.put(
                {...workspace, containers}
            );
            break;
        }
    }    
}

const promisifyStream = (stream, workspacesDB) => new Promise((resolve, reject) => {
    stream.on('data', data => {
        let json = JSON.parse(data.toString());        
        let status = json.status;
        let name = json.Actor.Attributes.name;
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
                    updateWorkspaceFromContainer(status, name, null, workspacesDB)
                    console.log({
                        status: container.data.State.Status,
                        name: container.data.Name,
                        ports: getPorts(container.data.NetworkSettings.Ports)
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

f()
