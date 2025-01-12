import { bind } from 'phecda-server/ws'
import { Factory } from 'phecda-server'
import { WebSocketServer } from 'ws'
import { TestRpc } from './test.rpc'

async function start() {
  const data = await Factory([TestRpc], {
    generators: [new RPCGenerator()],
  })
  const server = new WebSocketServer({ port: 3001 })

  bind(server, data)

  // eslint-disable-next-line no-console
  console.log('start listen at 3001...')
}

start()
