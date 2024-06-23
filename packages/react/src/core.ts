import { proxy } from 'valtio'
import { WebPhecda } from 'phecda-web'
import { createContext, useContext } from 'react'

export const PhecdaContext = createContext(createPhecda())

export function createPhecda() {
  return new WebPhecda((instance: any) => {
    return proxy(instance)
  })
}
export function usePhecda() {
  const activePhecda = useContext(PhecdaContext)

  if (!activePhecda && process.env.NODE_ENV === 'development')
    throw new Error('[phecda-react]: must under <PhecdaContext.Provider></PhecdaContext.Provider> or manually inject the phecda instance ')

  return activePhecda
}
