// /* eslint-disable no-console */
// import { createChainReq, createParallelReq, createReq, isError, toClass, useC } from 'phecda-client'
import axios from 'axios'
// import type { User } from '../server/test.controller'
import { axiosFetch, createClient } from 'phecda-client'
import { TestController } from '../server/test.controller'

// // const beacon = createBeacon('http://localhost:3699')
// const useRequest = createReq(instance)
// const useParallelReq = createParallelReq(instance)
// const { framework, login } = useC(TestController)

// const chain = createChainReq(instance, { $test: TestController }, { batch: true })

// async function request() {
//   const { data } = await useRequest(login(toClass<User>({ name: 'p1', password: '123456' })))
//   console.log('[normal request]:')
//   console.log(data)
// }

// // async function testFetch() {
// //   const { data } = await useRequest(query('1', 50))
// //   console.log('data', data)
// // }

// async function parallelRequest() {
//   const { data: [res1, res2] } = await useParallelReq([framework(), login(toClass<User>({ name: 'p2', password: '123456' }))])
//   console.log('[parallel request]:')

//   if (isError(res1))
//     console.error(res1.message)
//   else console.log(res1)

//   if (isError(res2))
//     console.error(res2.message)
//   else console.log(res2)
// }

// async function chainRequest() {
//   const data = await Promise.all([chain.$test.framework(), chain.options({
//   }).$test.login(toClass<User>({ name: 'p3', password: '123456' }))])

//   console.log('[chain and batch request]:')
//   console.log(data)
// }

// // testFetch()
// request()
// parallelRequest()
// chainRequest()

const instance = axios.create({
  baseURL: '/base',
})

const client = createClient({ $test: TestController }, { fetch: axiosFetch(instance) })

console.log(await
client.$test.framework())

console.log(await
client.$test.login({ name: 'p1', password: '123456' }))
