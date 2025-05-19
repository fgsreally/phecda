import { WsAdaptor, createClient } from 'phecda-client/rpc'
import { TestRpc } from '../ws/test.rpc'

// 辅助函数：将结果显示到界面
function appendResult(containerId: string, title: string, result: any, isError = false) {
  const container = document.getElementById(containerId)
  if (!container)
    return

  const div = document.createElement('div')
  div.className = `result-item${isError ? ' error' : ''}`
  div.innerHTML = `
    <strong>${title}</strong>
    <pre>${JSON.stringify(result, null, 2)}</pre>
  `
  container.appendChild(div)
}

// Axios 示例
async function runDemo() {
  const ws = new WebSocket('ws://localhost:3001')
  const client = createClient(
    { $test: TestRpc },
    WsAdaptor(ws),

  )

  ws.onopen = async () => {
    try {
      appendResult('ws-results', '2️⃣ 调用 run',
        await client.$test.run('run'))

      appendResult('ws-results', '2️⃣ 调用 event',
        await client.$test.event('run'))
    }
    catch (e) {
      appendResult('app', '❌ 错误:', e, true)
    }
  }
}

runDemo()
