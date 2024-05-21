import { SHARE_KEY, getOwnState, setState, setStateKey } from 'phecda-core'

export function Guard(...guards: string[]): any {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = SHARE_KEY
    target = key === SHARE_KEY ? target.prototype : target

    setStateKey(target, key)

    const state = getOwnState(target, key)
    if (!state.guards)
      state.guards = []
    state.guards.push(...guards)
    setState(target, key, state)
  }
}

export function Plugin(...plugins: string[]): any {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = SHARE_KEY
    target = key === SHARE_KEY ? target.prototype : target

    setStateKey(target, key)

    const state = getOwnState(target, key)
    if (!state.plugins)
      state.plugins = []
    state.plugins.push(...plugins)
    setState(target, key, state)
  }
}

export function Interceptor(...interceptors: string[]): any {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = SHARE_KEY
    target = key === SHARE_KEY ? target.prototype : target

    setStateKey(target, key)

    const state = getOwnState(target, key)
    if (!state.interceptors)
      state.interceptors = []
    state.interceptors.push(...interceptors)
    setState(target, key, state)
  }
}
export function Filter(filter: string): any {
  return (target: any, key?: PropertyKey) => {
    if (!key)
      key = SHARE_KEY
    target = key === SHARE_KEY ? target.prototype : target

    setStateKey(target, key)

    const state = getOwnState(target, key)
    state.filter = filter
    setState(target, key, state)
  }
}
export function Pipe(key?: string) {
  return (target: any, k?: PropertyKey, index?: any) => {
    if (!k) {
      k = SHARE_KEY
      target = target.prototype

      setStateKey(target, k)
      const state = getOwnState(target, k)
      state.pipe = key
      setState(target, k, state)
      return
    }
    if (typeof index !== 'number') {
      setStateKey(target, k)
      const state = getOwnState(target, k)
      state.pipe = key
      setState(target, k, state)

      return
    }

    setStateKey(target, k)

    const state = getOwnState(target, k)

    if (!state.params)
      state.params = []

    const existItem = state.params.find((item: any) => item.index === index)
    if (existItem)
      Object.assign(existItem, { pipe: key })

    else
      state.params.push({ pipe: key, index })

    setState(target, k, state)
  }
}
