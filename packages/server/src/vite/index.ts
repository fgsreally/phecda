import { resolve } from 'path'
import type { PluginOption } from 'vite'
import { FakeController } from '../fake'
import type { ServerMeta } from '../types'
export function Server(localPath?: string): PluginOption {
  let root: string
  return {
    name: 'phecda-server-vite:client',
    enforce: 'pre',
    configResolved(config) {
      root = config.root || process.cwd()
    },
    resolveId(id) {
      if (id.endsWith('.controller.ts') && localPath)
        return resolve(root, localPath)
    },
    transform(code, id) {
      if (id.endsWith('.p.js')) {
        const meta = JSON.parse(code) as ServerMeta[]
        const faker = new FakeController()

        for (const i of meta)
          faker.addMethod(i.name, i.method, i.route.route, i.route.type, i.params)
        return {
          code: faker.getContent(),
        }
      }
    },
  }
}
