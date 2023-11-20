import { register } from 'node:module'
import { MessageChannel } from 'node:worker_threads'

const { port1, port2 } = new MessageChannel()

register('./loader.mjs', {
  parentURL: import.meta.url,
  data: { port: port2 },
  transferList: [port2],
})

port1.on('message', async (data) => {
  const files = JSON.parse(data)
  for (const file of files)
    await globalThis.__PHECDA_SERVER_HMR__?.(file)

  await globalThis.__PHECDA_SERVER_META__?.()
})
