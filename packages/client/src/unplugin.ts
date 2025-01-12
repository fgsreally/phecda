import { basename, dirname, isAbsolute, resolve } from 'path'
import { createRequire } from 'module'
import { existsSync } from 'fs'
import { createUnplugin } from 'unplugin'
import axios from 'axios'
const require = createRequire(import.meta.url)

function getFileMid(file: string) {
  const filename = basename(file)
  const ret = filename.split('.')
  if (ret.length === 2)
    return ret[1]

  else
    return ''
}
export default createUnplugin((options: {
  configFile?: string
  port?: string
  interval?: number
  split?: boolean
  server?: boolean
} = {}) => {
  const { configFile = './ps.json', port, interval = 3000, split = false, server = false } = options
  const psconfigPath = resolve(process.cwd(), configFile)

  const workdir = dirname(psconfigPath)
  const config: any = existsSync(psconfigPath) ? require(psconfigPath) : {}
  let command: string
  return {
    name: 'phecda-client',
    enforce: 'pre',
    vite: {
      configResolved(config) {
        command = config.command
      },

      configureServer(server) {
        // 监视指定文件
        server.watcher.add(psconfigPath)

        server.watcher.on('add', (path) => {
          if (path === psconfigPath)
            server.restart()
        })
        server.watcher.on('change', (path) => {
          if (path === psconfigPath)
            server.restart()
        })
      },

      buildStart() {
        if (command !== 'serve' && config) {
          if (split && config.resolve) {
            config.resolve.forEach((item: any) => {
              if (item.filename) {
                this.emitFile({
                  type: 'chunk',
                  id: resolve(workdir, item.path),
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
      if (!config?.resolve || !importer || importer.includes('node_modules'))
        return
      if (id.startsWith('.') || id.startsWith('/') || isAbsolute(id)) {
        const sourceMid = getFileMid(id)
        if (sourceMid) {
          if (server) {
            const importerMid = getFileMid(importer)

            if (importerMid) {
              const resolver = config.resolve.find((item: any) => item.source === sourceMid && item.importer === importerMid)
              if (resolver)
                return resolve(workdir, resolver.path)
            }
          }
          else {
            const resolver = config.resolve.find((item: any) => item.source === sourceMid)

            if (resolver)
              return resolve(workdir, resolver.path)
          }
        }
      }
    },

  }
})
