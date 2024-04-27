/* eslint-disable no-console */
import { bind } from 'phecda-server/bullmq'

import { Factory } from 'phecda-server'
import { TestRpc } from '../test.rpc'
async function start() {
  const data = await Factory([TestRpc], {
    rpc: 'src/rpc/rpc.ts',
  })

  bind({ port: 6379 }, data)

  console.log('bullmq listen...')
}

start()
