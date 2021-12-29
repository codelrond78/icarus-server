const { spawn } = require("child_process");

const yaml = `
#yopi es mi mejor amigo
version: "3"
services:
  app:
    image: icarus/code-python:3.8
    environment:
      - REPO=https://github.com/libgit2/libgit2
      - GIT_USER=codelrond
      - GIT_USER_EMAIL=codelrond@protonmail.com
      - PASSWORD=123
    ports:
      - 8082:8080
`
//cmd = spawn("./up.sh", [], { env: { YAML: yaml, NAME: 'test' }})
cmd = spawn("./down.sh", [], { env: { YAML: yaml, NAME: 'test' }})

cmd.stdout.on("data", async data => {
    data = data.toString();
    console.log(`stdout: ${data}`);
}); 
cmd.stderr.on("data", async data => {
    data = data.toString();
    console.log(`stderr: ${data}`);
});