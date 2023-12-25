const autocannon = require('autocannon')

const url = `http://localhost:${process.env.PORT}/hello`
const method = 'POST'

// 生成动态请求头的函数
function generateHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Custom-Header': Math.random().toString(36).substring(7), // 生成随机值示例
  }
}

const requests = [
  {
    method,
    path: '/',
    headers: generateHeaders(), // 初始请求头
    body: 'hello ', // 你的请求体数据
  },
]

const instance = autocannon({
  url,
  method,
  connections: 200, // 并发连接数
  pipelining: 10, // 每个连接上发起的并行请求数
  duration: 5, // 测试运行时间（秒）
  requests,
}, (err, result) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(result)
})

autocannon.track(instance, { renderProgressBar: true })
