import { proxy } from 'valtio'
import { type Construct, WebPhecda } from 'phecda-web'
import { createContext } from 'react'

export const PhecdaContext = createContext<WebPhecda | undefined>(undefined)

export const phecdaSymbol = Symbol('')

export function createPhecda(models?: Construct[]) {
  const phecda = new WebPhecda('react', (instance: any) => {
    return proxy(instance)
  })
  models?.forEach(model => phecda.init(model))

  return phecda
}
