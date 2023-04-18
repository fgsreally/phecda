/* eslint-disable no-console */
import { $S, createMergeReq, createReq, isError } from 'phecda-server/client'
import axios from 'axios'
import { TestController } from './test.controller'
const instance = axios.create({
  baseURL: 'http://127.0.0.1:3699',
})
const useRequest = createReq(instance)
const useMergeRequest = createMergeReq(instance)
const { test, get } = new TestController()
async function request() {
  const { data } = await useRequest(test('phecda', 'server', '1'))
  console.log('[normal request]:')

  console.log(data)
}

async function seriesRequest() {
  const { data: [, res2] } = await useMergeRequest([get(), test($S(0, 'data'), 'server', '1')])
  console.log('[series request]:')

  if (isError(res2))
    console.error(res2.message)
  else console.log(res2)
}
async function mergeRequest() {
  const { data: [res1, res2] } = await useMergeRequest([test('phecda', 'server', '1'), get()])
  console.log('[merge request]:')

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
