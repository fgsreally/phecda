import { resolve } from 'path'
import { createUnplugin } from 'unplugin'
import axios from 'axios'
export const unplugin = createUnplugin((options: { localPath?: string; parseFile?: (id: string) => boolean; port?: string; interval?: number; split?: boolean } = {}) => {
  const { localPath = 'pmeta.js', parseFile = id => /[^.](?:\.rpc|\.controller|\.route)/.test(id), port, interval = 3000, split = false } = options

  let command: string
  const metaPath = resolve(process.cwd(), localPath).replace(/\\/g, '/')

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
            this.emitFile({
              type: 'chunk',
              id: metaPath,
              fileName: 'pmeta.js',
              preserveSignature: 'allow-extension',
            })
          }
        }
        else {
          if (port)// work for lazy load
            setInterval(() => axios.get(port).catch(() => {}), interval)
        }
      },

    },
    resolveId(id) {
      if (parseFile(id))

        return metaPath
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
