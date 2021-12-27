const fs = require('fs');
const {Docker} = require('node-docker-api');
 
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
 
// List
docker.container.list()
   // Inspect
  .then(containers => containers[0].status())
  .then(container => {
      let aux = container.data;
    console.log(aux.Name, aux.State.Status, aux.HostConfig.PortBindings)
  })
  /*
  .then(container => container.stats())
  .then(stats => {
    stats.on('data', stat => console.log('Stats: ', JSON.parse(stat.toString())))
    stats.on('error', err => console.log('Error: ', err))
  })
  */
  .catch(error => console.log(error));

  