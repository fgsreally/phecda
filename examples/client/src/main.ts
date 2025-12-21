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

    appendResult('axios-results', '调用/query?query1=1&query2=2 获取query',
      await client.$test.query('1', 2))

    appendResult('axios-results', '调用/query?query1=1 获取query',
      await client.$test.query('1'))

    try {
      // @ts-expect-error miss query
      await client.$test.query()
    }
    catch (e: any) {
      appendResult('axios-results', '调用/query  返回错误：', e.response.data.message)
    }

    appendResult('axios-results', '通过/param/1,调用/param/:param 获取param',
      await client.$test.param('1'))

    appendResult('axios-results', '调用/framework 获取使用框架:',
      await client.$test.framework())

    try {
      await client.$test.login({ name: 'phecda' } as any)
    }
    catch (e: any) {
      appendResult('axios-results', '调用 /login （缺少参数）返回错误：', e.response.data.message)
    }
    try {
      await client.$test.login({ name: 'phecda', password: 123456 } as any)
    }
    catch (e: any) {
      appendResult('axios-results', '调用 /login （参数错误）返回错误：', e.response.data.message)
    }

    appendResult('axios-results', '调用 login 接口成功:',
      await client.$test.login({ name: 'phecda', password: '123456' }))

    const parallelClient = createClient(
      { $test: TestController },
      axiosAdaptor(instance),
      { parallelRoute: '/__PHECDA_SERVER__' },
    )

    appendResult('axios-results', '3️⃣ 单个批量请求:',
      await parallelClient.$test.login({ name: 'p1', password: '123456' }))

    const [batchFramework, batchLogin] = await Promise.all([
      parallelClient.$test.framework(),
      parallelClient.$test.login({ name: 'p3', password: '123456' }),
    ])

    appendResult('axios-results', '多个批量请求（并行）:', {
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
      responded: async (response) => {
        if (response.headers.get('Content-Type')?.includes('application/json')) {
          const res = await response.json()

          if (response.status < 200 || response.status >= 300)
            throw new Error(res.message)

          return res
        }

        else { return response.text() }
      },
    })

    const client = createClient(
      { $test: TestController },
      alovaAdaptor(alovaInstance),
    )
    appendResult('alova-results', '调用/query?query1=1&query2=2 获取query',
      await client.$test.query('1', 2))

    appendResult('alova-results', '调用/query?query1=1 获取query',
      await client.$test.query('1'))

    try {
      // @ts-expect-error miss query
      await client.$test.query()
    }
    catch (e: any) {
      appendResult('alova-results', '调用/query  返回错误：', e.message)
    }

    appendResult('alova-results', '通过/param/1,调用/param/:param 获取param',
      await client.$test.param('1'))

    appendResult('alova-results', '调用/framework 获取使用框架:',
      await client.$test.framework())

    try {
      await client.$test.login({ name: 'phecda' } as any)
    }
    catch (e: any) {
      appendResult('alova-results', '调用 /login （缺少参数）返回错误：', e.message)
    }
    try {
      await client.$test.login({ name: 'phecda', password: 123456 } as any)
    }
    catch (e: any) {
      appendResult('alova-results', '调用 /login （参数错误）返回错误：', e.message)
    }

    appendResult('alova-results', '调用 login 接口成功:',
      await client.$test.login({ name: 'phecda', password: '123456' }))

    const parallelClient = createClient(
      { $test: TestController },
      alovaAdaptor(alovaInstance),
      { parallelRoute: '/__PHECDA_SERVER__' },
    )

    appendResult('alova-results', '单个批量请求:',
      await parallelClient.$test.login({ name: 'p1', password: '123456' }))

    const [batchFramework, batchLogin] = await Promise.all([
      parallelClient.$test.framework(),
      parallelClient.$test.login({ name: 'p3', password: '123456' }),
    ])

    appendResult('alova-results', '多个批量请求（并行）:', {
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
