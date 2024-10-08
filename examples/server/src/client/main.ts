/* eslint-disable no-console */
import axios from 'axios'
import { axiosFetch, createClient } from 'phecda-client'
import { TestController } from '../server/test.controller'

const instance = axios.create({
  baseURL: '/base',
})

const client = createClient({ $test: TestController }, { fetch: axiosFetch(instance) })

console.log('[simple request]:')

console.log(await
client.$test.framework())

console.log(await
client.$test.login({ name: 'p1', password: '123456' }))

const parallelClient = createClient({ $test: TestController }, { fetch: axiosFetch(instance), batch: true })

parallelClient.$test.login({ name: 'p1', password: '123456' }).then(console.log)
await Promise.resolve()
const data = await Promise.all([parallelClient.$test.framework(), parallelClient.$test.login({ name: 'p3', password: '123456' })])
console.log('[batch request]:')
console.log(data)
