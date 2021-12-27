const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const PouchDB = require('pouchdb');
const yaml = require('js-yaml');
const {run, stop, createWorkspace, updateWorkspace} = require('./commands');

const password = '123';
const remoteLog = new PouchDB(`http://admin:${password}@couchdb:5984/icarus_log`);
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

const app = new Koa();
const router = new Router();
app.use(bodyParser());

router.get('/', (ctx, next) => {
    ctx.body = 'Icarus!';
})
.put('/api/workspace/:name/run', async (ctx, next) => {
    const name = ctx.request.params.name;
    run(name, remoteLog);
    ctx.body = {"status": "starting"};
})
.put('/api/workspace/:name/stop', async (ctx, next) => {
    const name = ctx.request.params.name;
    stop(name, remoteLog);
    ctx.body = {"status": "stopping"};
})
.put('/api/workspaces/:name', async (ctx, next) => {
    const name = ctx.request.params.name;
    const description = ctx.request.body.description;
    const specification = yaml.load(ctx.request.body.specification);
    
    updateWorkspace(name, specification, ctx.request.body.specification);
    doc = {
        "line": {
            "type": "input",
            "text": `update-workspace ${name}`
        }
    }
    await remoteLog.post(doc);
    w = await localWorkspaces.get(name);
    await localWorkspaces.put({...w, description, specification});
/*        _id: name,
        _rev: w._rev,
        type: "workspace",
        description: description,
        specification: specification,
        status: w.status,
        containers: w.containers
    });*/
})
.post('/api/workspaces/:name', async (ctx, next) => {
    try{
        const name = ctx.request.params.name;
        const description = ctx.request.body.description;
        const specification = yaml.load(ctx.request.body.specification);
        
        createWorkspace(name, specification, ctx.request.body.specification);       
        doc = {
            "line": {
                "type": "input",
                "text": `create-workspace ${name}`
            }
        }
        await remoteLog.post(doc);
        await localWorkspaces.post({...w, description, specification, status: '-', containers: []});
        ctx.body = doc;
    }catch(err){
        console.log('error', err);
        ctx.body = {"error": err};
    }    
});

app
  .use(router.routes())
  .use(router.allowedMethods());

console.log('listening on 3001...')
app.listen(3001);