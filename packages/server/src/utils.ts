import pc from 'picocolors'
import type { AbConstruct, Construct } from 'phecda-core'
import { LOG_LEVEL } from './common'

let time: number

let internalLogger = console

export function setLogger(logger: typeof console) {
  internalLogger = logger
}

export function log(msg: string, level: 'error' | 'info' | 'warn' | 'log' = 'log') {
  const logLevel = {
    info: 0,
    log: 1,
    warn: 2,
    error: 3,
  }[level]

  if (logLevel < LOG_LEVEL)
    return

  const color = ({ error: 'red', info: 'gray', warn: 'yellow', log: 'green' } as const)[level]
  const date = new Date()
  const current = Date.now()
  const interval = (time && current - time) ? `+${current - time}` : ''
  time = current

  internalLogger[level](`${pc.magenta('[phecda-server]')} ${pc.gray(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)} ${pc[color](msg)} ${pc.gray(interval)}`)
}

export function Mix<C1 extends Construct | AbConstruct, C2 extends Construct>(InternalClass: C1, ExtendClass: C2) {
  return class extends InternalClass {
    constructor(...args: any) {
      super()
      Object.assign(this, new ExtendClass(...args))
    }
  } as new (...args: ConstructorParameters<C2>) => InstanceType<C1> & InstanceType<C2>
}
