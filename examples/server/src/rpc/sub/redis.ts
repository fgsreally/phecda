/* eslint-disable no-console */
import Redis from 'ioredis'
import { bind } from 'phecda-server/redis'
import { Factory } from 'phecda-server'
import { TestRpc } from '../test.rpc'
async function start() {
  const data = await Factory([TestRpc], {
    rpc: 'src/rpc/rpc.ts',
  })

  const pub = new Redis()
  const sub = new Redis()

  bind(sub, pub, data)

  console.log('redis listen...')
}

start()
