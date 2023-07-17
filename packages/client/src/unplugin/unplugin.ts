import { resolve } from 'path'
import { createUnplugin } from 'unplugin'
import type { P } from 'phecda-server'
import axios from 'axios'
import { Compiler } from '../compiler'
export const unplugin = createUnplugin((options: { localPath?: string; parseFile?: (id: string) => boolean; port?: string; interval?: number } = {}) => {
  const { localPath = 'pmeta.js', parseFile = id => id.endsWith('.controller'), port, interval = 3000 } = options

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
          this.emitFile({
            type: 'chunk',
            id: metaPath,
            fileName: localPath,
            preserveSignature: 'allow-extension',
          })
        }
        else {
          if (port)
            setInterval(() => axios.get(port), interval)
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

      if (command !== 'serve') {
        this.emitFile({
          type: 'asset',
          fileName: `${compiler.name}.client.ts`,
          needsCodeReference: false,
          source: compiler.createRequest(),
        })
      }

      return { code: compiler.getContent() }
    },

    transformInclude(id) {
      return id === metaPath
    },

  }
})
