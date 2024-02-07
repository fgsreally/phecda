# 微服务
提供与`http`体验一致的微服务

目前支持`rabbitmq`/`redis`

## 快速开始
`controller`是为`http`服务的，在这里需要的是`rpc`

创建`test.rpc.ts`
```ts
import { Arg, Event, Rpc } from 'phecda-server'

@Rpc('redis', 'mq')// 允许redis、rabbitmq访问，当然也可以标在方法上
export class TestRpc {
  run(@Arg()/** 只是一个标识 */ arg: string) {
    console.log(`arg is ${arg}`)
    return arg
  }

  @Event()// 标记这个是事件模式，不会返回任何值
  event(@Arg() arg: string) {
    console.log(`arg is ${arg}`)
  }
}
```


<details>
<summary>Rabbitmq</summary>

服务方
```ts
import amqp from 'amqplib'
import { bind } from 'phecda-server/rabbitmq'
import { Factory } from 'phecda-server'
import { TestRpc } from '../test.controller'
const data = await Factory([TestRpc], {
  rpc: 'src/rpc/mq.ts',
})

const conn = await amqp.connect('amqp://localhost:5672')

const ch = await conn.createChannel()

bind(ch, 'test', data)

console.log('mq listen...')
```

消费方

```ts
import { createClient } from 'phecda-server/rabbitmq'
import amqp from 'amqplib'
import { TestRpc } from '../test.rpc'// 要导向'src/rpc/mq.ts'
const conn = await amqp.connect('amqp://localhost:5672')

const ch = await conn.createChannel()
const client = await createClient(ch, 'test', {
  test: TestRpc,
})
const ret = await client.test.run('xx')
console.log(`return with ${ret}`)

const nullRet = client.test.event('event')

console.log(`return with ${nullRet}`)
```
</details>

<details>
<summary>Redis</summary>

服务方
```ts
import Redis from 'ioredis'
import { bind } from 'phecda-server/redis'
import { Factory } from 'phecda-server'
import { TestRpc } from '../test.rpc'
const data = await Factory([TestRpc], {
  rpc: 'src/rpc/redis.ts',
})

const redis = new Redis()

bind(redis, 'test', data)

console.log('redis listen...')
```

调用方

```ts
import { createClient } from 'phecda-server/redis'
import Redis from 'ioredis'
import { TestRpc } from '../test.rpc'// 要导向'src/rpc/redis.ts'
const redis = new Redis()

const client = await createClient(redis, 'test', {
  test: TestRpc,
})
const ret = await client.test.run('xx')
console.log(`return with ${ret}`)

const nullRet = client.test.event('event')

console.log(`return with ${nullRet}`)
```
</details>

:::info 注意

我假定，微服务中的调用方和服务方是在两个项目里（最起码是在monorepo中），不考虑同个服务的双端都在同个项目里。

这里显然需要一个类似`vite/rollup`的`resolve`的逻辑，可以有很多办法，比如使用打包器打个包，

但基于假定以及[想法](./auto-import.md)，请使用[npm](./client/npm.md)

:::