import type { InjectData } from './types'

export const DataMap = {} as InjectData

export function Provide<K extends keyof InjectData>(key: K, value: InjectData[K]) {
  DataMap[key] = value
}

export function Inject<K extends keyof InjectData>(key: K): InjectData[K] {
  return DataMap[key]
}

export const activeInstance: Record<string, any> = {}
// for function decorators like Watcher Storage
export function setInject(key: string, value: any) {
  activeInstance[key] = value
  return activeInstance
}

export function getInject(key: string) {
  return activeInstance[key]
}
