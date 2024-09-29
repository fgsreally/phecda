import { hostname } from 'os'

export function genClientQueue(key?: string) {
  return `PS-${key ? `${key}-` : ''}${hostname()}-${process.pid}`
}
