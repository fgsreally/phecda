import { register } from 'node:module'
import { MessageChannel } from 'node:worker_threads'
import { isPhecda, log } from '../dist/index.mjs'
import { RELAUNCH, RELOAD } from '../dist/helper.mjs'
import inspector from 'inspector'
const { port1, port2 } = new MessageChannel()

register('./loader.mjs', {
  parentURL: import.meta.url,
  data: { port: port2 },
  transferList: [port2],
})

let isRunning = true

const fileModelMap = new Map()

port1.on('message', async (data) => {
  const { type, files } = JSON.parse(data)
  if ((!isRunning && type !== 'init') || type === 'relaunch')
    return RELAUNCH()

  if (type === 'change' || type === 'init') {
    if (!files.length)
      return
    const oldModels = []
    const newModels = []
    for (const file of files) {
      oldModels.push(...fileModelMap.get(file) || [])
      const models = Object.values(await import(file)).filter(isPhecda)
      fileModelMap.set(file, models)
      newModels.push(...models)
    }
    if (type === 'change')
      return RELOAD(oldModels, newModels)
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


process.on('message', (data) => {
  if (data.type === 'inspect') {
    if (inspector.url()) {
      inspector.close();
      log('close inspector', 'info');
    } else {
      const { arg } = data

      if (arg) {
        if (arg.includes(':')) {
          const [host, port] = arg.split(':')
          inspector.open(Number(port), host)
        } else {
          inspector.open(Number(arg))
        }
      }else {
        inspector.open();
      }
      //  address already in use
      if (inspector.url())
        log(`open "devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&ws=${inspector.url().replace("ws://", '')}" in browser`, 'info');
    }
  }
})