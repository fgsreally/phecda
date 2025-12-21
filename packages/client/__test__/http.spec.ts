import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpAdaptor, createClient } from '../src/http'

describe('http client', () => {
  const mockSend = vi.fn(({ query, body }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (Array.isArray(body))
          resolve(body.map((item: any) => item && item.query.text))
        else
          resolve(query.text)
      }, 100)
    })
  })

  beforeEach(() => {
    mockSend.mockClear()
  })

  const mockAdapter: HttpAdaptor = () => {
    let _reject: (reason?: any) => void
    return {
      send: (...args) => {
        const promise = mockSend(...args)
        return new Promise((resolve, reject) => {
          _reject = reject
          promise.then(resolve)
        })
      },
      abort: () => {
        _reject('abort')
      },
    }
  }

  class TestController {
    getText(text: string) {
      return { tag: 'TestController', method: 'get', body: {}, headers: {}, query: { text }, params: {}, method: 'get', url: '/test/get', args: [] }
    }
  }

  const client = createClient({
    test: TestController,
  }, mockAdapter)

  const batchClient = createClient({
    test: TestController,
  }, mockAdapter, { parallelRoute: '/__PHECDA_SERVER__' })

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

  it('abort request', async () => {
    const request = client.test.getText('success')
    request.send()
    request.abort()
    await expect(request).rejects.toBe('abort')
  })

  it('batch request', async () => {
    const req1 = batchClient.test.getText('req1')
    const req2 = batchClient.test.getText('req2')
    req1.send()
    req2.send()
    expect(mockSend).toHaveBeenCalledTimes(0)
    await Promise.resolve()
    expect(mockSend).toHaveBeenCalledTimes(1)
    const req3 = batchClient.test.getText('req3')
    const req4 = batchClient.test.getText('req4')
    req3.send()
    req4.send()
    expect(await req1).toBe('req1')
    expect(await req2).toBe('req2')
    expect(await req3).toBe('req3')
    expect(await req4).toBe('req4')
    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('abort batch request', async () => {
    const req1 = batchClient.test.getText('req1')
    const req2 = batchClient.test.getText('req2')

    req1.send()
    req1.abort()
    req2.send()
    await expect(req1).rejects.toThrow('abort')
    expect(await req2).toBe('req2')
    expect(mockSend).toHaveBeenCalledTimes(1)

    const req3 = batchClient.test.getText('req3')
    req3.send()
    req3.abort()
    await expect(req3).rejects.toThrow('abort')
    expect(mockSend).toHaveBeenCalledTimes(1)
  })
})
