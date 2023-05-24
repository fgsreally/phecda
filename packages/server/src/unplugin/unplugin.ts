import { resolve } from 'path'
import { createUnplugin } from 'unplugin'
import { Compiler } from '../compiler'
import type { P } from '../types'

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
        if (command !== 'serve') {
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
