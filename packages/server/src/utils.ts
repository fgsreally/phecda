import pc from 'picocolors'
import type { Meta } from './meta'
export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === 'undefined'
export const isNil = (obj: any): obj is null | undefined =>
  isUndefined(obj) || obj === null

export const isObject = (fn: any): fn is object =>
  !isNil(fn) && typeof fn === 'object'

export function warn(msg: string, color = 'yellow') {
  // @ts-expect-error pc
  console.warn(`${pc.magenta('[phecda-server]')} ${pc[color](msg)}`)
}
