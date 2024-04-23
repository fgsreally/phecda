/* eslint-disable no-console */
import { bind } from 'phecda-server/nats'
import { Factory } from 'phecda-server'
import { connect } from 'nats'
import { TestRpc } from '../test.rpc'
async function start() {
  const data = await Factory([TestRpc], {
    rpc: 'src/rpc/rpc.ts',
  })

  const nc = await connect({ port: 4222 })

  bind(nc, data)

  console.log('nats listen...')
}

start()
