const { spawn } = require("child_process");
const { logInputLine, logOutputLine} = require("./logdatabase");
    
async function command(cmd, name, specification, db){
    cmd_ = spawn(cmd, [], { env: { YAML: specification, NAME: name }})

    await logInputLine(cmd + ' ' + name, db)
    cmd_.stdout.on("data", async data => {
        data = data.toString();
        console.log(`stdout: ${data}`);
        await logOutputLine(data, db)
    }); 
    cmd_.stderr.on("data", async data => {
        data = data.toString();
        console.log(`stderr: ${data}`);
        await logOutputLine(data, db)
    });
}

async function run(name, specification, db){
    await command('./up.sh', name, specification, db)
}

async function stop(name, specification, db){
    await command('./down.sh', name, specification, db)
}

module.exports = {
    run,
    stop
}