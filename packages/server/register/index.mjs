import { register } from 'node:module'
import { MessageChannel } from 'node:worker_threads'
import { log } from '../dist/index.mjs'

const { port1, port2 } = new MessageChannel()

register('./loader.mjs', {
  parentURL: import.meta.url,
  data: { port: port2 },
  transferList: [port2],
})

let isRunning = true

port1.on('message', async (data) => {
  const { type, files } = JSON.parse(data)

  if (!isRunning || !globalThis.__PS_HMR__ || type === 'relaunch')
    return process.exit(2)// file change -> relaunch

  if (type === 'change') {
    log('reload module...')

    for (const cb of globalThis.__PS_HMR__) await cb(files)

    log('reload done')
  }
})

process.on('uncaughtException', (err) => {
  log('Uncaught Exception:', 'error')
  isRunning = false
  console.error(err)
})

process.on('unhandledRejection', (err) => {
  log('Unhandled Promise Rejection:', 'error')
  isRunning = false

  console.error(err)
})
