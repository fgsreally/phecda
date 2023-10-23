/* eslint-disable no-console */
import { $S, createChainReq, createParallelReq, createReq, createSeriesReq, isError, useC } from 'phecda-client'
import axios from 'axios'
import { TestController } from './test.controller'
const instance = axios.create({
  baseURL: 'http://localhost:3699/base',
})
// const beacon = createBeacon('http://localhost:3699')
const useRequest = createReq(instance)
const useParallelReq = createParallelReq(instance)
const useSeriesReq = createSeriesReq(instance)
const { test, get, query } = useC(TestController)
const $test = useC(TestController)

const chain = createChainReq(instance, { $test }, { batch: true })

async function chainRequest() {
  const data = await Promise.all([chain.options({
  }).$test.test('110', 'server', { id: '1', name: 'test' }), chain.$test.get()])
  console.log('[chain and batch request]:')
  console.log(data)
  console.log('[chain request second]:')

  console.log(await chain.$test.get())

}

async function request() {
  const { data } = await useRequest(test('110', 'server', { id: '1', name: 'test' }))
  console.log('[normal request]:')

  console.log(data)
}

async function testFetch() {
  const { data } = await useRequest(query('1'))
  console.log('data', data)
}

async function seriesRequest() {
  const { data: [, res2] } = await useSeriesReq([get(), test($S(0, 'data'), '1', { id: '1', name: 'test' })])
  console.log('[series request]:')

  if (isError(res2))
    console.error(res2.message)
  else console.log(res2)
}
async function mergeRequest() {
  const { data: [res1, res2] } = await useSeriesReq([test('0', '1', { id: '1', name: 'test' }), get()])
  console.log('[merge request]:')

  if (isError(res1))
    console.error(res1.message)
  else console.log(res1)

  if (isError(res2))
    console.error(res2.message)
  else console.log(res2)
}

async function parallelRequest() {
  const { data: [res1, res2] } = await useParallelReq([get(), test('0', '1', { id: '1', name: 'test' })])
  console.log('[parallel request]:')

  if (isError(res1))
    console.error(res1.message)
  else console.log(res1)

  if (isError(res2))
    console.error(res2.message)
  else console.log(res2)
}

chainRequest()
testFetch()
request()
mergeRequest()
seriesRequest()
parallelRequest()
testFetch()
