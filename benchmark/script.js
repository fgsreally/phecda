const autocannon = require('autocannon')

const url = `http://localhost:${process.env.PORT}/hello`
const method = 'POST'

const instance = autocannon(
  {
    url,
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ name: 'hello world' }),
    connections: 200, // 并发连接数
    pipelining: 10, // 每个连接上发起的并行请求数
    duration: 5, // 测试运行时间（秒）

  },
  (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  },
)

autocannon.track(instance, { renderProgressBar: true })
