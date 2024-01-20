import pc from 'picocolors'
import { DataMap } from 'phecda-core'

let time: number

export function log(msg: string, level: 'error' | 'info' | 'warn' = 'info') {
  const color = ({ error: 'red', info: 'green', warn: 'yellow' } as const)[level]
  const date = new Date()
  const current = Date.now()
  const interval = (time && current - time) ? `+${current - time}` : ''
  time = current
  // eslint-disable-next-line no-console
  console.log(`${pc.magenta('[phecda-server]')} ${pc.gray(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)} ${pc[color](msg)} ${pc.gray(interval)}`)
}

export function getConfig<C = any>(key: string, defaultConf?: C): C {
  if (!DataMap[key]) {
    if (defaultConf)
      return defaultConf
    throw new Error(`config "${key}" is not existed`)
  }

  return DataMap[key]
}

export function setConfig<C = any>(key: string, conf: C, force = true) {
  if (DataMap[key] && !force)
    return

  DataMap[key] = conf
}





