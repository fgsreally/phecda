/* eslint-disable no-console */
import HyperExpress from 'hyper-express'
import { bindApp } from 'phecda-server/hyper-express'
import { Factory } from 'phecda-server'
import { TestController } from './test.controller'

const data = await Factory([TestController], {
  http: 'pmeta.js',
})
const webserver = new HyperExpress.Server()

const router = new HyperExpress.Router()

webserver.use('/base', router)

bindApp(router, data)

webserver.listen(3008)
  .then(() => console.log(' started hyper-express'),
  )
