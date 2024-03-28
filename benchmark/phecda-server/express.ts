/* eslint-disable no-console */
/* eslint-disable import/first */

console.time('cold-start')
import { bindApp } from 'phecda-server/express'
import { Factory } from 'phecda-server'
// @ts-expect-error miss types
import express from 'express'
import { AppController } from './app.controller'

async function start() {
  const data = await Factory([AppController])
  const router = express.Router()

  const app = express()

  app.use(express.json())
  bindApp(router, data)
  app.use(router)

  app.listen(process.env.PORT, () => {
    console.timeEnd('cold-start')
    console.log(`phecda-server/express started on port ${process.env.PORT}`)
  })
}

start()
