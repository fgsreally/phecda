
# Rabbitmq

### 安装依赖

```shell
npm i amqplib
```

### 服务方

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

### 消费方

```ts
import { createClient } from 'phecda-server/rabbitmq'
import amqp from 'amqplib'
import { TestRpc } from '../test.rpc' // 要导向'src/rpc/mq.ts'
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

