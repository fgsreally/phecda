console.time('cold-start');

const Koa = require('koa');
const router = require('@koa/router')();
const { koaBody } = require('koa-body');

const app = new Koa();

app.use(koaBody());

router.post('/hello', async function(ctx) {
  ctx.body = ctx.request.body
});

app.use(router.routes());

app.listen(3001, () => {
  console.timeEnd('cold-start');
  console.log('Koa started on port 3001');
});