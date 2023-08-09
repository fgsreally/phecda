# rabbitmq
`controller`这一层没有区别
> 这时候`Body`/`Query`/`Params`没什么意义，但每个参数必须有装饰器修饰（随便哪一个）
需要`phecda-rabbitmq`


## 服务方
```ts
import { Factory } from 'phecda-server'
import { bindMQ } from 'phecda-rabbitmq'
import amqp from 'amqplib'

import { TestController } from './test.controller'

async function start() {
  console.log('start mq...')
  const data = await Factory([TestController])

  const connect = await amqp.connect('amqp://127.0.0.1:5672')
  const channel = await connect.createChannel()
  bindMQ(channel, data)
}
start()
```

## 调用方

```ts
import * as amqp from 'amqplib'
import { createMqPub } from 'phecda-rabbitmq'
import { useC } from 'phecda-client'// just types
import { TestController } from './test.controller?client'
const { mq } = useC(TestController)
const connect = await amqp.connect('amqp://localhost:5672')
const channel = await connect.createChannel()
const publish = createMqPub(channel)
await publish(mq('hello world'))
```
:::warning 提醒
如果需要服务端 同时作为调用方和服务方，这个时候要修改插件的配置，一个建议是对`?client`结尾的文件，走虚拟文件，并创建调用函数，
:::

注意，这只满足简单的使用，如果需要交换机的部分，其没办法抽象成函数层级，故不支持

