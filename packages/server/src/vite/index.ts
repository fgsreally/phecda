import type { PluginOption } from 'vite'
import { FakeController } from '../fake'
import type { ServerMeta } from '../types'
// const VIRTUAL_ID = 'virtual:phecda-server'

// export function Client(): PluginOption {
//   return {
//     name: 'phecda-server-vite:server',
//     resolveId(id: string) {
//       if (id.endsWith('.controller.ts'))
//         return VIRTUAL_ID
//     },
//     async load(id) {
//       if (id === VIRTUAL_ID) {
//         const { data } = await axios.get()
//       }
//     },
//   }
// }

export function Server(): PluginOption {
  return {
    name: 'phecda-server-vite:client',
    transform(code, id) {
      if (id.endsWith('.p.json')) {
        const meta = JSON.parse(code) as ServerMeta[]
        const faker = new FakeController()

        for (const i of meta)
          faker.addMethod(i.name, i.method, i.params)
        return faker.getContent()
      }
    },
  }
}
