import { describe, expect, it } from 'vitest'
import { RpcAdapter, createClient } from '../src/rpc'

describe('rpc client', async () => {
  const mockAdapter: RpcAdapter = ({
    receive,
  }) => {
    return {
      send: ({ data }) => {
        Promise.resolve().then(() => {
          receive({
            id: data.id,
            data: data.args[0],
            error: null,
          })
        })
      },

    }
  }

  class TestRpc {
    getText(info: string) {
      return { tag: 'TestRpc', method: 'getText', isEvent: false, queue: 'test', args: [info] }
    }
  }

  const client = createClient({
    test: TestRpc,
  }, mockAdapter)

  it('auto send request(await)', async () => {
    expect(await client.test.getText('success')).toBe('success')
  })

  it('manual send request', async () => {
    const request = client.test.getText('success')

    request.send()

    await request.then((res) => {
      expect(res).toBe('success')
    })
  })
})
