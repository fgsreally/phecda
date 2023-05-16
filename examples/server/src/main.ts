/* eslint-disable no-console */
import { $S, createBeacon, createParallelReq, createReq, createSeriesReq, isError, useC } from 'phecda-server/client'
import axios from 'axios'
import { TestController } from './test.controller'
const instance = axios.create({
  baseURL: 'http://localhost:3699',
})
const beacon = createBeacon('http://localhost:3699')
const useRequest = createReq(instance)
const useParallelReq = createParallelReq(instance)
const useSeriesReq = createSeriesReq(instance)
const { test, get } = useC(TestController)
async function request() {
  const { data } = await useRequest(test('110', 'server', '1'))
  console.log('[normal request]:')

  console.log(data)
}

async function testFetch() {
  console.log('[normal beacon]:')

  beacon(test('phecda', 'server', '1'))
}

async function seriesRequest() {
  const { data: [, res2] } = await useSeriesReq([get(), test($S(0, 'data'), 'server', '1')])
  console.log('[series request]:')

  if (isError(res2))
    console.error(res2.message)
  else console.log(res2)
}
async function mergeRequest() {
  const { data: [res1, res2] } = await useSeriesReq([test('merge', 'server', '1'), get()])
  console.log('[merge request]:')

  if (isError(res1))
    console.error(res1.message)
  else console.log(res1)

  if (isError(res2))
    console.error(res2.message)
  else console.log(res2)
}

async function parallelRequest() {
  const { data: [res1, res2] } = await useParallelReq([get(), test('parallel', 'server', '1')])
  console.log('[parallel request]:')

  if (isError(res1))
    console.error(res1.message)
  else console.log(res1)

  if (isError(res2))
    console.error(res2.message)
  else console.log(res2)
}

request()
mergeRequest()
seriesRequest()
parallelRequest()
// testFetch()
