import { Router, Server } from 'hyper-express'
import { bind } from 'phecda-server/hyper-express'
import { Factory, HTTPGenerator, log } from 'phecda-server'
import { TestController } from './modules/test.controller'

const data = await Factory([TestController], {
  generators: [new HTTPGenerator()],
})
const webserver = new Server()

const router = new Router()

webserver.use('/base', router)

bind(router, data)

webserver.listen(3008)
  .then(() => log('started hyper-express'),
  )
