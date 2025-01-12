import { ElectronAdaptor, createClient } from 'phecda-client/rpc'
import { TestRpc } from '../electron/test.rpc'

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
  try {
    const client = createClient(
      { $test: TestRpc },
      ElectronAdaptor('electronAPI'),

    )

    appendResult('electron-results', '2️⃣ 调用 run',
      await client.$test.run('run'))

    appendResult('electron-results', '2️⃣ 调用 event',
      await client.$test.event('run'))
  }
  catch (error) {
    appendResult('app', '❌ 错误:', error, true)
  }
}

runDemo()
