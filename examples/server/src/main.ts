import { createReq } from 'phecda-server/client'
import { TestController } from './test.controller'
const useRequest = createReq()
const { test } = new TestController()
async function request() {
  const { data } = await useRequest(test('phecda', 'server', '1'))
  console.log(data)
}

request()
