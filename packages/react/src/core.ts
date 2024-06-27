import { proxy } from 'valtio'
import { WebPhecda } from 'phecda-web'
import { createContext } from 'react'

export const PhecdaContext = createContext<WebPhecda | undefined>(undefined)

export const phecdaSymbol = Symbol('')

export function createPhecda() {
  return new WebPhecda('react', (instance: any) => {
    return proxy(instance)
  })
}
