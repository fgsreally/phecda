import { resolve } from 'path'
import type { PluginOption } from 'vite'
import { normalizePath } from 'vite'
import { Pcompiler } from '../compiler'
import type { ServerMeta } from '../types'
export function Server(localPath = 'pmeta.js'): PluginOption {
  let root: string
  let metaPath: string
  let command: string
  return {
    name: 'phecda-server-vite:client',
    enforce: 'pre',
    configResolved(config) {
      command = config.command
      root = config.root || process.cwd()
      metaPath = normalizePath(resolve(root, localPath))
    },

    buildStart() {
      if (command === 'build') {
        this.emitFile({
          type: 'chunk',
          id: metaPath,
          fileName: localPath,
          preserveSignature: 'allow-extension',
        })
      }
    },
    resolveId(id) {
      if (id.endsWith('.controller'))

        return metaPath
    },

    transform(code, id) {
      if (id === metaPath) {
        const meta = JSON.parse(code) as ServerMeta[]
        const compiler = new Pcompiler()

        for (const i of meta)
          compiler.addMethod(i.name, i.method, i.route?.route, i.route?.type, i.params)

        return {
          code: compiler.getContent(),
        }
      }
    },
  }
}
