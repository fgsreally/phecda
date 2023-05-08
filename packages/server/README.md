# phecda-server
types share between server and client, `nestjs` format

## express

actually, it works as a set of middlewares
### server side
```ts
// in test.controller.ts
import { Body, Controller, Get, Param, Post, Query, Watcher, emitter } from 'phecda-server'

@Controller('/base')
export class TestController {
  @Post('/:test')
  async test(@Param('test') test: string, @Body('name') name: string, @Query('id') id: string) {
    console.log(`${test}-${name}-${id}`)
    emitter.emit('watch', 1)
    return `${test}-${name}-${id}`
  }

  @Get('/get')
  async get() {
    return {
      data: 'test',
    }
  }
}
```
```ts
// in server.ts
import fs from 'fs'
import { Factory, bindApp } from 'phecda-server'
import express from 'express'
import { TestController } from './test.controller'
const data = await Factory([TestController])
fs.writeFileSync('meta.p.js', JSON.stringify(data.meta.map(item => item.data)))
const app = express()
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})
app.use(express.json())

bindApp(app, data)
```

### client side

```ts
// in vite.config.ts

import { defineConfig } from 'vite'
import { Server } from 'phecda-server'

export default defineConfig({
  plugins: [Server('meta.p.js')],

})
```

```ts
// in  main.ts

import { $S, createBeacon, createMergeReq, createReq, isError } from 'phecda-server/client'
import axios from 'axios'
import { TestController } from './test.controller'

const instance = axios.create({
  // ...
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
```