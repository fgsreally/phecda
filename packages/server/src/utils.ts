import pc from 'picocolors'
import { LOG_LEVEL } from './common'

let time: number

let internalLogger: Record<LogLevel, (msg: string) => void>

type LogLevel = 'error' | 'info' | 'warn' | 'log' | 'debug'

export function setLogger(logger: Record<LogLevel, (msg: string) => void>) {
  internalLogger = logger
}
export function getLogger() {
  return internalLogger
}

export function log(msg: string, level: LogLevel = 'log') {

  if (internalLogger) {
    internalLogger[level](msg)
  }
  const logLevel = {
    debug: -1,
    info: 0,
    log: 1,
    warn: 2,
    error: 3,
  }[level]

  if (logLevel < LOG_LEVEL)
    return

  const color = ({ debug: 'bgMagenta', error: 'red', info: 'gray', warn: 'yellow', log: 'green' } as const)[level]
  const date = new Date()
  const current = Date.now()
  const interval = (time && current - time) ? `+${current - time}` : ''
  time = current

  console[level](`${pc.magenta('[phecda-server]')} ${pc.gray(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)} ${pc[color](msg)} ${pc.gray(interval)}`)
}

export { Mixin } from 'ts-mixer'
