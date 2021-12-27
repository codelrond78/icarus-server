const fs = require('fs');
const {Docker} = require('node-docker-api');

function getPorts(raw){
    console.log(raw)
    let ports = new Set();
    for (let [key, value] of Object.entries(raw)) {
        console.log(key, value);
        for(let port of value){
            console.log(port);
            ports.add(port.HostPort)
        }
    }
    return ports;
}

const promisifyStream = stream => new Promise((resolve, reject) => {
    stream.on('data', data => {
        let json = JSON.parse(data.toString());        
        if(json.status === 'destroy'){
            console.log({
                status: json.status,
                name: json.Actor.Attributes.name
            });
        }
        else if(json.status === 'start'){ 
            try{
                docker.container.get(json.id).status().then(container => {
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
 
const docker = new Docker({ socketPath: '/var/run/docker.sock' })
 
docker.events({
    since: ((new Date().getTime() / 1000) - 60).toFixed(0)
})
  .then(stream => promisifyStream(stream))
  .catch(error => console.log(error))