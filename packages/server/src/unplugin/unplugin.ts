import { resolve } from 'path'
import { createUnplugin } from 'unplugin'
import { Pcompiler } from '../compiler'
import type { ServerMeta } from '../types'

export const unplugin = createUnplugin((options: { localPath?: string } = {}) => {
  const { localPath = 'pmeta.js' } = options

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
        if (command === 'build') {
          this.emitFile({
            type: 'chunk',
            id: metaPath,
            fileName: localPath,
            preserveSignature: 'allow-extension',
          })
        }
      },
    },
    resolveId(id) {
      if (id.endsWith('.controller'))

        return metaPath
    },

    transformInclude(id) {
      return id === metaPath
    },
    transform(code) {
      const meta = JSON.parse(code) as ServerMeta[]
      const compiler = new Pcompiler()

      for (const i of meta)
        compiler.addMethod(i)

      return {
        code: compiler.getContent(),
      }
    },
  }
})
