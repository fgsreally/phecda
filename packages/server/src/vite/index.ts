import { resolve } from 'path'
import type { PluginOption } from 'vite'
import { Pcompiler } from '../compiler'
import type { ServerMeta } from '../types'
export function Server(localPath: string): PluginOption {
  let root: string
  let metaPath: string
  return {
    name: 'phecda-server-vite:client',
    enforce: 'pre',
    configResolved(config) {
      root = config.root || process.cwd()
      metaPath = resolve(root, localPath)
    },
    resolveId(id) {
      if (id.endsWith('.controller.ts') && localPath)
        return metaPath
    },
    transform: {
      handler(code, id) {
        if (id === metaPath) {
          const meta = JSON.parse(code) as ServerMeta[]
          const faker = new Pcompiler()

          for (const i of meta)
            faker.addMethod(i.name, i.method, i.route?.route, i.route?.type, i.params)
          return {
            code: faker.getContent(),
          }
        }
      },
    },
  }
}
