/* eslint-disable no-console */
import { createClient } from 'phecda-server/redis'
import Redis from 'ioredis'
import { TestRpc } from '../test.rpc'
export async function start() {
  const redis = new Redis()

  const client = await createClient(redis, 'test', {
    test: TestRpc,
  })
  const ret = await client.test.run('xx')
  console.log(`return with ${ret}`)

  const nullRet = client.test.event('event')

  console.log(`return with ${nullRet}`)
}

start()
