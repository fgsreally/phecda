import { createClient } from 'phecda-server/redis'
import Redis from 'ioredis'
import type { TestRpc } from '../test.controller'
import { TestRpc as Faker } from '../redis'
export async function start() {
  const redis = new Redis()

  const client = await createClient(redis, 'test', {
    test: Faker as unknown as typeof TestRpc,
  })
  const ret = await client.test.run('xx')
  console.log(`return with ${ret}`)
}

start()
