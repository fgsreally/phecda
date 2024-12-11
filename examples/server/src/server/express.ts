import { bind } from 'phecda-server/express'
import { Factory, HTTPGenerator, log } from 'phecda-server'
import express from 'express'
import cookie from 'cookie-parser'
import { TestController } from '@/test.controller'
async function start() {
  const data = await Factory([TestController], {
    generators: [new HTTPGenerator()],
  })
  const router = express.Router()
  const app = express()
  app.use(cookie())
  app.all('*', (_req, res, next) => {
    // console.log(req.headers)
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', '*')
    next()
  })

  app.use(express.json())
  bind(router, data, {
    globalGuards: ['a'],

  })
  app.use('/base', router)

  app.listen(3008, () => {
    log('start express server...')
  })
}

start()
