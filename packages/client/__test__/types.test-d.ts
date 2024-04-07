import { describe, expectTypeOf, it } from 'vitest'
import type { P } from 'phecda-server'
import axios from 'axios'
import { createChainReq, createParallelReq, createReq, isError, useC } from '../src'

describe('client types', () => {
  class TestController {
    name: string
    test(name: string, age: number) {
      return {
        name: name + age,

      }
    }

    test2() {
      return true
    }
  }

  const instance = axios.create()

  it('base', async () => {
    const { test, test2 } = useC(TestController)
    const useParallelReq = createParallelReq(instance)
    const useRequest = createReq(instance)

        expectTypeOf(useC(TestController)).not.toMatchTypeOf<{ name: string }>
        expectTypeOf((await useRequest(test('a', 10))).data).toEqualTypeOf<{ name: string }>()

        const { data: [ret1, ret2] } = await useParallelReq([test('a', 10), test2()])
        if (isError(ret1))
            expectTypeOf(ret1).toEqualTypeOf<P.Error>
        else expectTypeOf(ret1).toEqualTypeOf<{ name: string }>
        if (isError(ret2))
            expectTypeOf(ret2).toEqualTypeOf<P.Error>
        else expectTypeOf(ret2).toEqualTypeOf<boolean>
  })

  it('chain', () => {
    const chain = createChainReq(instance, { $test: TestController }, { batch: true })

    expectTypeOf(chain.$test.test('a', 10)).toEqualTypeOf<Promise<{ name: string }>>
  })
})
