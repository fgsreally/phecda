console.time('cold-start')

const Koa = require('koa')
const router = require('@koa/router')()
const { koaBody } = require('koa-body')

const app = new Koa()

app.use(koaBody())

router.post('/hello', async (ctx) => {
  ctx.body = ctx.request.body
})

app.use(router.routes())

app.listen(process.env.PORT, () => {
  console.timeEnd('cold-start')
  console.log(`Koa started on port ${process.env.PORT}`)
})
