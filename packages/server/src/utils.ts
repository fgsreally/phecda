import pc from 'picocolors'
import type { AbConstruct, Construct } from 'phecda-core'
import { DataMap } from 'phecda-core'
import { IS_LOG_BAN } from './common'

let time: number

export function log(msg: string, level: 'error' | 'info' | 'warn' = 'info') {
  if (IS_LOG_BAN)
    return

  const color = ({ error: 'red', info: 'green', warn: 'yellow' } as const)[level]
  const date = new Date()
  const current = Date.now()
  const interval = (time && current - time) ? `+${current - time}` : ''
  time = current
  // eslint-disable-next-line no-console
  console.log(`${pc.magenta('[phecda-server]')} ${pc.gray(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)} ${pc[color](msg)} ${pc.gray(interval)}`)
}

/**
 * @deprecated
 */
export function getConfig<C = any>(key: string, defaultConf?: C): C {
  if (!DataMap[key]) {
    if (defaultConf)
      return defaultConf
    throw new Error(`config "${key}" is not existed`)
  }

  return DataMap[key]
}
/**
 * @deprecated
 */
export function setConfig<C = any>(key: string, conf: C, force = true) {
  if (DataMap[key] && !force)
    return

  DataMap[key] = conf
}

export function Mix<C1 extends Construct | AbConstruct, C2 extends Construct>(InternalClass: C1, ExtendClass: C2) {
  return class extends ExtendClass {
    constructor(...args: any) {
      super(...args)
      // @ts-expect-error extends internal abstract class
      Object.assign(this, new InternalClass())
    }
  } as new (...args: ConstructorParameters<C2>) => InstanceType<C1> & InstanceType<C2>
}
