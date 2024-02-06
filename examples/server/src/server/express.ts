/* eslint-disable no-console */
import { bindApp } from 'phecda-server/express'
import { Factory } from 'phecda-server'
import express from 'express'
import { TestController } from './test.controller'

const data = await Factory([TestController], {
  http: 'pmeta.js',
})
const router = express.Router()

// addFilter('test', (e, tag, ctx) => {
//   const readableStream = fs.createReadStream('./index.html')
//   readableStream.pipe(ctx.response)

//   return new Promise((resolve) => {
//     readableStream.on('finish', () => {
//     // 当数据流传输完成时，中止后续中间件的执行
//       resolve({ error: false })
//     })
//   })
// })

const app = express()
app.all('*', (req, res, next) => {
  // console.log(req.headers)
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})
app.use(express.json())
bindApp(router, data, {
  globalGuards: ['a'],
  globalInterceptors: ['b'],
})
app.use('/base', router)

app.listen('3010', () => {
  console.log('start express server...')
})
