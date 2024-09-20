import { setMeta } from 'phecda-core'
import { BaseParam } from './param'
export function Guard(...guards: string[]) {
  return (target: any, property?: PropertyKey) => {
    setMeta(target, property, undefined, {
      guards,
    })

  }
}

export function Plugin(...plugins: string[]) {
  return (target: any, property?: PropertyKey) => {
    setMeta(target, property, undefined, {
      plugins,
    })
  }
}

export function Interceptor(...interceptors: string[]) {
  return (target: any, property?: PropertyKey) => {
    setMeta(target, property, undefined, {
      interceptors,
    })
  }
}
export function Filter(filter: string) {
  return (target: any, property?: PropertyKey) => {
    setMeta(target, property, undefined, {
      filter,
    })
  }
}
export function Pipe(pipe?: string) {
  return (target: any, property?: any, index?: any) => {
    if (typeof index === 'number') {
      BaseParam({ pipe })(target, property, index)

      return
    }
    setMeta(target, property, undefined, {
      pipe,
    })
  }
}
