/* eslint-disable no-console */
import { bind } from 'phecda-server/bullmq'

import { Factory, RPCGenerator } from 'phecda-server'
import { TestRpc } from '../test.rpc'
async function start() {
  const data = await Factory([TestRpc], {
    generators: [new RPCGenerator()],
  })

  bind(data, {
    workerOpts: {
      connection: { port: 6379 },
    },
    queueOpts: {
      connection: { port: 6379 },
    },
  })

  console.log('bullmq listen...')
}

start()
