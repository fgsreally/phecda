import { proxy } from 'valtio'
import { WebPhecda } from 'phecda-web'
import { createContext } from 'react'

export const PhecdaContext = createContext(createPhecda())

export function createPhecda() {
  return new WebPhecda((instance: any) => {
    return proxy(instance)
  })
}
