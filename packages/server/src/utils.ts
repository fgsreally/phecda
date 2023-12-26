import pc from 'picocolors'

export function log(msg: string, level: 'error' | 'info' | 'warn' = 'info') {
  const color = ({ error: 'red', info: 'green', warn: 'yellow' } as const)[level]
  const date = new Date()
  // eslint-disable-next-line no-console
  console.log(`${pc.magenta('[phecda-server]')} ${pc.gray(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)} ${pc[color](msg)}`)
}
