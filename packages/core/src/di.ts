import type { InjectData } from './types'
import { Empty } from './decorators/core'

export const DataMap = {} as InjectData

export function Provide<K extends keyof InjectData>(key: K, value: InjectData[K]) {
  DataMap[key] = value
}

const EmptyProxy: any = new Proxy(Empty, {
  apply() {
    return EmptyProxy
  },
})

// for any custom value to inject

export function Inject<K extends keyof InjectData>(key: K): InjectData[K] {
  return DataMap[key] || EmptyProxy/** work for @Inject(x)(...) */
}

export const activeInstance: Record<string, any> = {}
// for function decorators like Watcher Storage
export function injectProperty(key: string, value: any) {
  activeInstance[key] = value
  return activeInstance
}

export function getProperty(key: string) {
  return activeInstance[key]
}
