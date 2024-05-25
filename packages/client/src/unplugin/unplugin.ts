import { resolve } from 'path'
import { createRequire } from 'module'
import { createUnplugin } from 'unplugin'
import axios from 'axios'
const require = createRequire(import.meta.url)
export const unplugin = createUnplugin((options: {
  configFile?: string
  port?: string
  interval?: number
  split?: boolean
} = {}) => {
  const { configFile = 'ps.json', port, interval = 3000, split = false } = options

  const config = require(configFile)

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
          if (split && config.resolve) {
            config.resolve.forEach((item: any) => {
              if (item.filename) {
                this.emitFile({
                  type: 'chunk',
                  id: resolve(process.cwd(), item.path),
                  fileName: item.filename,
                  preserveSignature: 'allow-extension',
                })
              }
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
      if (!config.resovle)
        return
      const sourceMatch = id.match(/[^.]\.(^.*)$/)
      if (sourceMatch) {
        if (config.mode === 'server') {
          if (importer) {
            const importerMatch = importer.match(/[^.]\.(^.*)\.ts$/)
            if (importerMatch) {
              const resolver = config.resovle.find((item: any) => item.source === sourceMatch[1] && item.importer === importerMatch[1])
              if (resolver)
                return resolve(process.cwd(), resolver.path)
            }
          }
        }
        else {
          const resolver = config.resovle.find((item: any) => item.source === sourceMatch[1])
          if (resolver)
            return resolve(process.cwd(), resolver.path)
        }
      }
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
