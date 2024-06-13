# Kafka

### 安装依赖

```shell
npm i kafkajs
```

### 服务方

```ts
import { Kafka } from 'kafkajs'
import { bind } from 'phecda-server/kafka'
import { Factory, RPCGenerator } from 'phecda-server'
import { TestRpc } from '../test.rpc'
const data = await Factory([TestRpc], {
  generators: [new RPCGenerator()]
})

const redis = new Kafka({
  clientId: 'clientId',
  brokers: [],
})
bind(kafka, 'test', data)

console.log('kafka listen...')
```

### 调用方

```ts
import { createClient } from 'phecda-server/kafka'
import { Kafka } from 'kafkajs'
import { TestRpc } from '../test.rpc' // 要导向'src/rpc/redis.ts'
const kafka = new Kafka({
  clientId: 'clientId',
  brokers: [],
})

const client = await createClient(kafka, 'test', {
  test: TestRpc,
})
const ret = await client.test.run('xx')
console.log(`return with ${ret}`)

const nullRet = client.test.event('event')

console.log(`return with ${nullRet}`)
```

