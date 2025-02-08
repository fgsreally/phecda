/* eslint-disable no-console */
import { createClient } from 'phecda-client/rpc'
import { adaptor } from 'phecda-client/redis'

import Redis from 'ioredis'
import { TestRpc } from '../test.rpc'
export async function start() {
  const pub = new Redis()
  const sub = new Redis()
  const client = createClient({ test: TestRpc }, adaptor({ pub, sub }))
  const ret = await client.test.run('xx')
  console.log(`return with ${ret}`)

  const nullRet = await client.test.event('event')

  console.log(`return with ${nullRet}`)
}

start()
