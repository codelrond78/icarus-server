const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const PouchDB = require('pouchdb');
const {Docker} = require('node-docker-api');
const yaml = require('js-yaml');

const docker = new Docker({ socketPath: '/var/run/docker.sock' })

//function sleep(ms) {
//    return new Promise(resolve => setTimeout(resolve, ms));
//}

const password = '123';

const localLog = new PouchDB('localLog');
const remoteLog = new PouchDB(`http://admin:${password}@localhost:5984/icarus_log`);

localLog.sync(remoteLog, {
    live: true,
    retry: true,
}).on('change', function (change) {
    console.log(change)
}).on('error', function (err) {
    console.log('err en log:', err)
});

const localWorkspaces = new PouchDB('localWorkspaces')
const remoteWorkspaces = new PouchDB(`http://admin:${password}@couchdb:5984/workspaces`)

localWorkspaces.sync(remoteWorkspaces, {
    live: true,
    retry: true,
filter: 'example/myWorkspaces',
}).on('change', function (change) {
    console.log(change)
}).on('error', function (err) {
    console.log('err en log:', err)
});

async function f(){
    try{
        const docs = await localWorkspaces.allDocs();
        console.log(docs);
        return docs;
    }catch(err){
        console.log('hay un error');
    }      
    console.log('done');
}
 
const promisifyStream = stream => new Promise((resolve, reject) => {
    stream.on('data', data => {
        let json = JSON.parse(data.toString());
        if(json.status === 'start' || json.status === 'stop' || json.status === 'destroy'){
            console.log(json)
        }        
    })
    stream.on('end', resolve)
    stream.on('error', reject)
})
 
docker.events({
    since: ((new Date().getTime() / 1000) - 60).toFixed(0)
})
  .then(stream => promisifyStream(stream))
  .catch(error => console.log(error))

const app = new Koa();
const router = new Router();
app.use(bodyParser());

router.get('/', (ctx, next) => {
    ctx.body = 'Icarus!';
})
.post('/api/workspaces/:name', async (ctx, next) => {
    try{
        const name = ctx.request.params.name;
        const ret = yaml.load(ctx.request.body.specification)
        doc = {
            "line": {
                "type": "input",
                "text": `create-workspace ${name}`
            }
        }
        await localLog.post(doc);
        ctx.body = doc;
    }catch(err){
        console.log('error', err);
        ctx.body = {"error": err};
    }    
});

app
  .use(router.routes())
  .use(router.allowedMethods());

/*
app.use(async ctx => {
    ret = await f();
    ctx.body = ret;
});
*/

console.log('listening on 3001...')
app.listen(3001);