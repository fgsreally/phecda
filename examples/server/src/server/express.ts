import { bindApp } from 'phecda-server/express'
import { Factory,addPlugin } from 'phecda-server'
import express from 'express'
import { TestController } from './test.controller'
const data = await Factory([TestController], {
  http: 'pmeta.js',
})
const router = express.Router()

addPlugin('test', (req, res, next) => {
  res.set('X-Custom-Header', 'default')
  next()
})



const app = express()
app.all('*', (req, res, next) => {
  // console.log(req.headers)
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})
app.use(express.json())
bindApp(router, data)
app.use('/base', router)

app.listen('3008', () => {
  console.log('start server..')
})
