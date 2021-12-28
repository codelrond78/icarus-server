const fs = require('fs');
const path = require('path');
const { spawn } = require("child_process");
    
const WORKSPACES_PATH = '/workspaces';

function directoriesInDIrectory(pth){
    return fs.readdirSync(pth, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);
}

function updateWorkspace(name, specification, raw){

    myPath = path.join(WORKSPACES_PATH, name);
    fs.writeFileSync(path.join(myPath, 'docker-compose.yaml'), raw, err => {
        if (err) {
          console.error(err)
          return
        }
    });
    const dirs = directoriesInDIrectory(myPath);
    for(let name of Object.keys(specification.services)){
        if(!dirs.includes(name)) {
            fs.mkdirSync(path.join(myPath, name));
        }   
    }
}


function createWorkspace(name, specification, raw){

    myPath = path.join(WORKSPACES_PATH, name);
    fs.mkdirSync(myPath);
    fs.writeFileSync(path.join(myPath, 'docker-compose.yaml'), raw, err => {
        if (err) {
          console.error(err)
          return
        }
    });
    for(let name of Object.keys(specification.services)){
        fs.mkdirSync(path.join(myPath, name));
    }
}

async function run(name, db){
    const cmd = spawn("docker-compose", ["-f", `/workspaces/${name}/docker-compose.yaml`, "up", "-d"]);
    await db.post({
        line: {
            type: "input",
            text: `docker-compose -f /workspaces/${name} up -d`
    }})
    cmd.stdout.on("data", async data => {
        console.log(`stdout: ${data}`);
        await db.post({
            line: {
                type: "output",
                text: `${data}`
        }});
    }); 
    cmd.stderr.on("data", async data => {
        console.log(data);
        await db.post({
            line: {
                type: "output",
                text: `${data}`
        }});
    });
}

async function stop(name, db){
    const cmd = spawn("docker-compose", ["-f", `/workspaces/${name}/docker-compose.yaml`, "down"]);
    await db.post({
        line: {
            type: "input",
            text: `docker-compose -f /workspaces/${name} down`
    }})
    cmd.stdout.on("data", async data => {
        console.log(data);
        await db.post({
            line: {
                type: "output",
                text: `${data}`
        }});
    }); 
    cmd.stderr.on("data", async data => {
        console.log(data);
        await db.post({
            line: {
                type: "output",
                text: `${data}`
        }});
    });
}

module.exports = {
    run,
    stop,
    createWorkspace,
    updateWorkspace
}