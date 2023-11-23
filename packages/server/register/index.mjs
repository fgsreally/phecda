import { register } from 'node:module'
import { MessageChannel } from 'node:worker_threads'
import pc from 'picocolors'

const { port1, port2 } = new MessageChannel()

register('./loader.mjs', {
  parentURL: import.meta.url,
  data: { port: port2 },
  transferList: [port2],
})

port1.on('message', async (data) => {
  if (!globalThis.__PHECDA_SERVER_HMR__)
    return

  const { type, files } = JSON.parse(data)
  if (type === 'change') {
    log('reload module...')

    for (const file of files.reverse())
      await globalThis.__PHECDA_SERVER_HMR__?.(file)

    log('reload done')

    await globalThis.__PHECDA_SERVER_META__?.()
  }
})

function log(msg, color = 'green') {
  const date = new Date()
  // eslint-disable-next-line no-console
  console.log(`${pc.gray(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)} ${pc.magenta('[phecda-server]')} ${pc[color](msg)}`)
}
