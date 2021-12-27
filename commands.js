const fs = require('fs');
const path = require('path');
const { spawn } = require("child_process");
    
const WORKSPACES_PATH = '/workspaces';

function createWorkspace(name, specification, raw){

    myPath = path.join(WORKSPACES_PATH, name);
    fs.mkdirSync(myPath);
    fs.writeFileSync(path.join(myPath, 'docker-compose.yaml'), raw, err => {
        if (err) {
          console.error(err)
          return
        }
    });
    for(let name of specification.services){
        fs.mkdirSync(path.join(wpath, name));
    }
}

function run(name, db){
    const cmd = spawn("docker-compose", ["-f", `/workspaces/${name}/docker-compose.yaml`, "up", "-d"]);
    db.post({
        line: {
            type: "input",
            text: `docker-compose -f /workspaces/${name} up -d`
    }})
    cmd.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
        db.post({
            line: {
                type: "output",
                text: `${data}`
        }});
    }); 
    cmd.stderr.on("data", data => {
        db.post({
            line: {
                type: "output",
                text: `${data}`
        }});
    });
}

function stop(name, db){
    const cmd = spawn("docker-compose", ["-f", `/workspaces/${name}/docker-compose.yaml`, "down"]);
    db.post({
        line: {
            type: "input",
            text: `docker-compose -f /workspaces/${name} down`
    }})
    cmd.stdout.on("data", data => {
        db.post({
            line: {
                type: "output",
                text: `${data}`
        }});
    }); 
    cmd.stderr.on("data", data => {
        db.post({
            line: {
                type: "output",
                text: `${data}`
        }});
    });
}

module.exports = {
    run,
    stop,
    createWorkspace
}