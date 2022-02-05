const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const PouchDB = require('pouchdb');
const {run, stop, remove} = require('./commands');
const {dockerListener} = require('./dockerevents');

const password = '123';
const remoteLog = new PouchDB(`http://admin:${password}@couchdb:5984/icarus_log`);
const remoteWorkspaces = new PouchDB(`http://admin:${password}@couchdb:5984/workspaces`)

const app = new Koa();
const router = new Router();
app.use(bodyParser());

router.get('/', (ctx, next) => {
    ctx.body = 'Icarus!';
})
.put('/api/workspace/:name/run', async (ctx, next) => {
    try{
        const name = ctx.request.params.name;
        const specification = ctx.request.body.specification;
        await run(name, specification, remoteLog);
        ctx.body = {"status": "starting"};
    }catch(err){
        console.log('error', err);
        ctx.body = {"error": err};
    }   
})
.put('/api/workspace/:name/stop', async (ctx, next) => {
    try{
        const name = ctx.request.params.name;
        const specification = ctx.request.body.specification;
        await stop(name, specification, remoteLog);
        ctx.body = {"status": "stopping"};
    }catch(err){
        console.log('error', err);
        ctx.body = {"error": err};
    }   
})
.put('/api/workspace/:name/delete', async (ctx, next) => {
    try{
        const name = ctx.request.params.name;
        const specification = ctx.request.body.specification;
        await remove(name, specification, remoteLog);
        ctx.body = {"status": "deleting"};
    }catch(err){
        console.log('error', err);
        ctx.body = {"error": err};
    }   
})
;

app
  .use(router.routes())
  .use(router.allowedMethods());

dockerListener(remoteWorkspaces);

console.log('listening on 5000...')
app.listen(5000);