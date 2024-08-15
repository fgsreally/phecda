import { setMeta } from 'phecda-core'

export function Queue(queue = '', isEvent?: boolean) {
  return (target: any, property?: PropertyKey) => {
    setMeta(target, property, { queue, isEvent })
  }
}

export function Rpc(): ClassDecorator {
  return (target: any) => {
    setMeta(target, undefined, {
      controller: 'rpc',
    })
  }
}
