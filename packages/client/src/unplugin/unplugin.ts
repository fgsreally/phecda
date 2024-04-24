import { resolve } from 'path'
import { createUnplugin } from 'unplugin'
import axios from 'axios'
export const unplugin = createUnplugin((options: {
  rpc?: string
  http?: string
  resolveFile?: (id: string, importer?: string) => 'http' | 'rpc' | void
  port?: string
  interval?: number
  split?: boolean
} = {}) => {
  const { http = process.env.PS_HTTP_CODE, rpc = process.env.PS_RPC_CODE, resolveFile = id => /[^.](?:\.controller)/.test(id) && 'http', port, interval = 3000, split = false } = options

  const httpCodeFile = http && resolve(process.cwd(), http)
  const rpcCodeFile = rpc && resolve(process.cwd(), rpc)

  let command: string

  return {
    name: 'phecda-server:client',
    enforce: 'pre',
    vite: {
      configResolved(config) {
        command = config.command
      },

      buildStart() {
        if (command !== 'serve') {
          if (split) {
            httpCodeFile && this.emitFile({
              type: 'chunk',
              id: httpCodeFile,
              fileName: 'http.js',
              preserveSignature: 'allow-extension',
            })

            rpcCodeFile && this.emitFile({
              type: 'chunk',
              id: rpcCodeFile,
              fileName: 'rpc.js',
              preserveSignature: 'allow-extension',
            })
          }
        }
        else {
          if (port)// work for lazy load
            setInterval(() => axios.get(port).catch(() => { }), interval)
        }
      },

    },
    resolveId(id, importer) {
      const ret = resolveFile(id, importer)
      if (ret)
        return ret === 'http' ? httpCodeFile : rpcCodeFile

      if (importer && /[^.](?:\.client)/.test(importer) && /[^.](?:\.rpc)/.test(id))

        return rpcCodeFile

      if (importer && /[^.](?:\.http)/.test(importer) && /[^.](?:\.controller)/.test(id))

        return httpCodeFile
    },
    // transform(code) {
    //   const meta = JSON.parse(code) as P.MetaData[]
    //   const compiler = new Compiler()

    //   for (const i of meta)
    //     compiler.addMethod(i)

    //   return { code: compiler.getContent() }
    // },

    // transformInclude(id) {
    //   return id === metaPath
    // },

  }
})
