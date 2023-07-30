import { resolve } from 'path'
import { createUnplugin } from 'unplugin'
import type { P } from 'phecda-server'
import axios from 'axios'
import { Compiler } from '../compiler'
export const unplugin = createUnplugin((options: { localPath?: string; parseFile?: (id: string) => boolean; port?: string; interval?: number; split?: boolean } = {}) => {
  const { localPath = 'pmeta.js', parseFile = id => id.includes('.controller') || id.includes('.route'), port, interval = 3000, split = false } = options

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
          if (port)
            setInterval(() => axios.get(port).catch(() => {}), interval)
        }
      },

    },
    resolveId(id) {
      if (parseFile(id))
        return metaPath
    },
    transform(code) {
      const meta = JSON.parse(code) as P.Meta[]
      const compiler = new Compiler()

      for (const i of meta)
        compiler.addMethod(i)

      return { code: compiler.getContent() }
    },

    transformInclude(id) {
      return id === metaPath
    },

  }
})
