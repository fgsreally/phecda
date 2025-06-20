import axios from 'axios'
import { createAlova } from 'alova'
import adapterFetch from 'alova/fetch'
import { createClient } from 'phecda-client/http'
import { adaptor as axiosAdaptor } from 'phecda-client/axios'
import { adaptor as alovaAdaptor } from 'phecda-client/alova'
import { TestController } from 'example-http/client'
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
async function runAxiosDemo() {
  try {
    const instance = axios.create({
      baseURL: '/base',
    })

    const client = createClient({ $test: TestController }, axiosAdaptor(instance))


    appendResult('axios-results', '1️⃣ 调用 framework 接口:',
      await client.$test.framework())

    appendResult('axios-results', '2️⃣ 调用 login 接口:',
      await client.$test.login({ name: 'p1', password: '123456' }))

    // appendResult('axios-results', '3️⃣ 调用 upload 接口:',
    //   await client.$test.uploadFile('1', new File(['test'], 'test.txt', { type: 'text/plain' })))

    // appendResult('axios-results', '4️⃣ 调用 uploadFiles 接口:',
    //   await client.$test.uploadFiles('1', [new File(['test1'], 'test1.txt', { type: 'text/plain' }), new File(['test2'], 'test2.txt', { type: 'text/plain' })]))

    const parallelClient = createClient(
      { $test: TestController },
      axiosAdaptor(instance),
      { batch: true },
    )

    appendResult('axios-results', '3️⃣ 单个批量请求:',
      await parallelClient.$test.login({ name: 'p1', password: '123456' }))

    const [batchFramework, batchLogin] = await Promise.all([
      parallelClient.$test.framework(),
      parallelClient.$test.login({ name: 'p3', password: '123456' }),
    ])

    appendResult('axios-results', '4️⃣ 多个并行批量请求:', {
      framework: batchFramework,
      login: batchLogin,
    })
  }
  catch (error) {
    appendResult('axios-results', '❌ 错误:', error, true)
  }
}

// Alova 示例
async function runAlovaDemo() {
  try {
    const alovaInstance = createAlova({
      requestAdapter: adapterFetch(),
      baseURL: '/base',
      responded: (response) => {
        if (response.headers.get('Content-Type')?.includes('application/json'))

          return response.json()

        else

          return response.text()
      },
    })

    const client = createClient(
      { $test: TestController },
      alovaAdaptor(alovaInstance),
    )

    appendResult('alova-results', '1️⃣ 调用 framework 接口:',
      await client.$test.framework())

    appendResult('alova-results', '2️⃣ 调用 login 接口:',
      await client.$test.login({ name: 'p1', password: '123456' }))

    // appendResult('alova-results', '3️⃣ 调用 upload 接口:',
    //   await client.$test.uploadFile('2', new File(['test'], 'a_test.txt', { type: 'text/plain' })))

    // appendResult('alova-results', '4️⃣ 调用 uploadFiles 接口:',
    //   await client.$test.uploadFiles('2', [new File(['test1'], 'a_test1.txt', { type: 'text/plain' }), new File(['test2'], 'a_test2.txt', { type: 'text/plain' })]))

    const parallelClient = createClient(
      { $test: TestController },
      alovaAdaptor(alovaInstance),
      { batch: true },
    )

    appendResult('alova-results', '3️⃣ 单个批量请求:',
      await parallelClient.$test.login({ name: 'p1', password: '123456' }))

    const [batchFramework, batchLogin] = await Promise.all([
      parallelClient.$test.framework(),
      parallelClient.$test.login({ name: 'p3', password: '123456' }),
    ])

    appendResult('alova-results', '4️⃣ 多个并行批量请求:', {
      framework: batchFramework,
      login: batchLogin,
    })
  }
  catch (error) {
    console.error(error)
    appendResult('alova-results', '❌ 错误:', error, true)
  }
}

// 运行演示
Promise.all([
  runAxiosDemo(),
  runAlovaDemo(),
]).catch(error => appendResult('app', '❌ 程序执行失败:', error, true))
