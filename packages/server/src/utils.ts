import pc from 'picocolors'
import { LOG_LEVEL } from './common'
import { HttpContext } from './http/types'

export type LogLevel = 'error' | 'info' | 'warn' | 'log' | 'debug'

export interface Logger {
  log(msg: string, level: LogLevel, ctx?: string): void
}

class InternalLogger {
  time: number
  color = { debug: 'bgMagenta', error: 'red', info: 'gray', warn: 'yellow', log: 'green' } as const
  dateFormatter = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: '2-digit',
    month: '2-digit',
  })

  diffTimestamp() {
    const now = Date.now()

    if (!this.time)
      return ''
    const diff = now - this.time

    this.time = now

    return diff ? pc.yellow(` +${diff}`) : ''
  }

  colorize(message: string, logLevel: LogLevel) {
    return pc[this.color[logLevel]](message)
  }

  isAllowLog(level: LogLevel) {
    const logLevel = {
      debug: -1,
      info: 0,
      log: 1,
      warn: 2,
      error: 3,
    }[level]

    if (logLevel < LOG_LEVEL)
      return false

    return true
  }

  log(msg: string, level: LogLevel, ctx?: string) {
    if (!this.isAllowLog(level))
      return
    msg = this.colorize(msg, level)
    const pidMsg = this.colorize(`[phecda-server] ${process.pid}`, level)
    const ctxMsg = ctx ? this.colorize(pc.bold(`[${ctx}] `), level) : ''
    const timeDiff = this.diffTimestamp()
    const levelMsg = this.colorize(level.toUpperCase().padStart(7, ' '), level)
    process.stdout.write(`${pidMsg} ${this.dateFormatter.format(Date.now())} ${levelMsg} ${ctxMsg}${msg}${timeDiff}\n`)
  }
}

let _logger: Logger = new InternalLogger()

export function setLogger(logger: Logger) {
  _logger = logger
}
export function getLogger() {
  return _logger
}

export function log(msg: string, level: LogLevel = 'log', ctx?: any) {
  _logger.log(msg, level, ctx)
}

export function runMiddleware(ctx: HttpContext, middleware: (req: any, res: any, next?: any) => any) {
  return new Promise((resolve) => {
    middleware(ctx.getRequest(), ctx.getResponse(), resolve)
  })
}

export { Mixin } from 'ts-mixer'
