/* eslint-disable no-console */
import { createClient } from 'phecda-server/nats'
import { connect } from 'nats'
import { TestRpc } from '../test.rpc'

export async function start() {
  const nc = await connect({ port: 4222 })

  const client = await createClient(nc, {
    test: TestRpc,
  })
  const ret = await client.test.run('xx')
  console.log(`return with ${ret}`)

  const nullRet = await client.test.event('event')

  console.log(`return with ${nullRet}`)
}

start()
