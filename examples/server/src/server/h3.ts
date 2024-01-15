import { createServer } from 'node:http'
import { createApp, createRouter, toNodeListener, useBase } from 'h3'
import { bindApp } from 'phecda-server/h3'
import { Factory } from 'phecda-server'
import { TestController } from './test.controller'
const data = await Factory([TestController], {
  http: 'pmeta.js',
})
const app = createApp()
const router = createRouter()

// addFilter('test', (e, tag, ctx) => {
//   const readableStream = fs.createReadStream('./index.html')
//   sendStream(ctx.event, readableStream)

//   return new Promise((resolve) => {
//     readableStream.on('finish', () => {
//     // 当数据流传输完成时，中止后续中间件的执行
//       resolve({ error: false })
//     })
//   })
// })

bindApp(router, data)
app.use('/base', useBase('', router.handler))

createServer(toNodeListener(app)).listen(3009)
