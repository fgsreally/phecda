import Redis from 'ioredis'
import { bind } from 'phecda-server/redis'
import { Factory } from 'phecda-server'
import { TestRpc } from '../test.controller'
async function start() {
  const data = await Factory([TestRpc], {
    rpc: 'src/rpc/redis.ts',
  })

  const redis = new Redis()

  bind(redis, 'test', data)

  console.log('redis listen...')
}

start()
