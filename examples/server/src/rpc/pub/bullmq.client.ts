/* eslint-disable no-console */
import { createClient } from 'phecda-server/bullmq'
import { TestRpc } from '../test.rpc'

export async function start() {
  const client = await createClient({ port: 6379 }, {
    test: TestRpc,
  })
  const ret = await client.test.run('xx')
  console.log(`return with ${ret}`)

  const nullRet = await client.test.event('event')

  console.log(`return with ${nullRet}`)
}

start()
