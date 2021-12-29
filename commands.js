const fs = require('fs');
const path = require('path');
const { spawn } = require("child_process");
const { logInputLine, logOutputLine} = require("./logdatabase");
    
const WORKSPACES_PATH = '/workspaces';

/*
function directoriesInDIrectory(pth){
    return fs.readdirSync(pth, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);
}*/

function updateWorkspace(name, specification, raw){

    myPath = path.join(WORKSPACES_PATH, name);
    fs.writeFileSync(path.join(myPath, 'docker-compose.yaml'), raw, err => {
        if (err) {
          console.error(err)
          return
        }
    });
    /*
    const dirs = directoriesInDIrectory(myPath);
    for(let name of Object.keys(specification.services)){
        if(!dirs.includes(name)) {
            fs.mkdirSync(path.join(myPath, name));
        }   
    }*/
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
    /*for(let name of Object.keys(specification.services)){
        fs.mkdirSync(path.join(myPath, name));
    }*/
}

async function command(cmd, name, specification, db){
    cmd = spawn("./down.sh", [], { env: { YAML: specification, NAME: name }})

    await logInputLine(line, db)
    cmd.stdout.on("data", async data => {
        data = data.toString();
        console.log(`stdout: ${data}`);
        await logOutputLine(data, db)
    }); 
    cmd.stderr.on("data", async data => {
        data = data.toString();
        console.log(`stderr: ${data}`);
        await logOutputLine(data, db)
    });
}

async function run(name, specification, db){
    await command('./up.sh', name, specification, db)
    /*await command("docker-compose",
                  ["-f", `/workspaces/${name}/docker-compose.yaml`, "up", "-d"],
                  db);
    */
}

async function stop(name, db){
    await command('./down.sh', name, specification, db)
    /*await command("docker-compose",
                  ["-f", `/workspaces/${name}/docker-compose.yaml`, "down"],
                  db);
    */
}

module.exports = {
    run,
    stop,
    createWorkspace,
    updateWorkspace
}