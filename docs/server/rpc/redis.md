# Redis

### 安装依赖

```shell
npm i ioredis
```

### 服务方

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

### 调用方

```ts
import { createClient } from 'phecda-server/redis'
import Redis from 'ioredis'
import { TestRpc } from '../test.rpc' // 要导向'src/rpc/redis.ts'
const redis = new Redis()

const client = await createClient(redis, 'test', {
  test: TestRpc,
})
const ret = await client.test.run('xx')
console.log(`return with ${ret}`)

const nullRet = client.test.event('event')

console.log(`return with ${nullRet}`)
```

