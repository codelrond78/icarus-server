const fs = require('fs');
const {Docker} = require('node-docker-api');
 
const promisifyStream = stream => new Promise((resolve, reject) => {
    stream.on('data', data => {
        let json = JSON.parse(data.toString());        
        if(json.status === 'destroy'){
            console.log(json);
        }
        else if(json.status === 'start'){ //|| json.status === 'stop' /*|| json.status === 'destroy'*/){
            //console.log(json)
            docker.container.get(json.id).status().then(container => {
                //console.log(container);
                console.log(container.data.NetworkSettings.Ports)
            });
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