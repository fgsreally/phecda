import { setMeta } from 'phecda-core'
import { BaseParam } from './param'
export function Guard(...guards: string[]) {
  return (target: any, property?: PropertyKey) => {
    setMeta(target, property, {
      guards,
    })

    // setPropertyState(target, property, (state) => {
    //   if (!state.guards)
    //     state.guards = new Set([...(getMeta(target, property)?.guards || [])])

    //   guards.forEach((guard) => {
    //     if (state.guards.has(guard))
    //       state.guards.delete(guard)

    //     state.guards.add(guard)
    //   })
    // })
  }
}

export function Plugin(...plugins: string[]) {
  return (target: any, property?: PropertyKey) => {
    setMeta(target, property, {
      plugins,
    })
  }
}

export function Interceptor(...interceptors: string[]) {
  return (target: any, property?: PropertyKey) => {
    setMeta(target, property, {
      interceptors,
    })
  }
}
export function Filter(filter: string) {
  return (target: any, property?: PropertyKey) => {
    setMeta(target, property, {
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
    setMeta(target, property, {
      pipe,
    })
  }
}
