import fs from 'fs'
import { Factory, bindApp } from 'phecda-server'
import express from 'express'
import { TestController } from './test.controller'
const data = Factory([TestController])
fs.writeFileSync('meta.p.js', JSON.stringify(data.meta.map(item => item.data)))
const app = express()
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})
app.use(express.json())

bindApp(app, data)

export const viteNodeApp = app
