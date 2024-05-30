/* eslint-disable no-console */
import { createChainReq, createParallelReq, createReq, isError, toClass, useC } from 'phecda-client'
import axios from 'axios'
import type { User } from '../server/test.controller'
import { TestController } from '../server/test.controller'
const instance = axios.create({
  baseURL: '/base',
})

// const beacon = createBeacon('http://localhost:3699')
const useRequest = createReq(instance)
const useParallelReq = createParallelReq(instance)
const { framework, login } = useC(TestController)

const chain = createChainReq(instance, { $test: TestController }, { batch: true })

async function chainRequest() {
  const data = await Promise.all([chain.$test.framework(), chain.options({
  }).$test.login(toClass<User>({ name: 'p', password: '123456' }))])

  console.log('[chain and batch request]:')
  console.log(data)
  console.log('[chain request second]:')
  console.log(await chain.$test.emitTest())
}

async function request() {
  const { data } = await useRequest(login(toClass<User>({ name: 'p', password: '123456' })))
  console.log('[normal request]:')
  console.log(data)
}

// async function testFetch() {
//   const { data } = await useRequest(query('1', 50))
//   console.log('data', data)
// }

async function parallelRequest() {
  const { data: [res1, res2] } = await useParallelReq([framework(), login(toClass<User>({ name: 'p', password: '123456' }))])
  console.log('[parallel request]:')

  if (isError(res1))
    console.error(res1.message)
  else console.log(res1)

  if (isError(res2))
    console.error(res2.message)
  else console.log(res2)
}
// testFetch()
request()
chainRequest()

parallelRequest()
