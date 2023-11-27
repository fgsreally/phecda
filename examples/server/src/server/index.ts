import { Err, Factory, bindApp } from 'phecda-server'
import express from 'express'
import { TestController } from './test.controller'
const data = await Factory([TestController], {
  dev: true,
})
const router = express.Router()

const app = express()
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})
app.use(express.json())
bindApp(router, data)
app.use('/base', router)

app.listen('3020', () => {
  console.log('start server..')
})
