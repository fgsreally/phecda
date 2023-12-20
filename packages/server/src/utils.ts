import pc from 'picocolors'
import type { UsePipeOptions } from 'phecda-core'
import { getExposeKey, isPhecda, plainToClass } from 'phecda-core'
export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === 'undefined'
export const isNil = (obj: any): obj is null | undefined =>
  isUndefined(obj) || obj === null

export const isObject = (fn: any): fn is object =>
  !isNil(fn) && typeof fn === 'object'

export function warn(msg: string, color = 'yellow') {
  // @ts-expect-error no matter
  console.warn(`${pc.magenta('[phecda-server]')} ${pc[color](msg)}`)
}

export async function plainToNestedClass(target: any, value: any, opts?: UsePipeOptions) {
  const { err, data: instance } = await plainToClass(target, value, opts)

  const vars = getExposeKey(instance).filter(item => item !== '__CLASS')
  for (const v of vars) {
    const module = Reflect.getMetadata('design:type', instance, v as string)
    if (isPhecda(module)) {
      const { instance: i, err: e } = await plainToNestedClass(module, value[v], opts)
      instance[v] = i
      err.push(...e)
    }
  }

  return { instance, err }
}
