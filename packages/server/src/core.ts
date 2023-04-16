import 'reflect-metadata'
import type { Phecda } from 'phecda-core'
import { getModelState, getState } from 'phecda-core'

import type { ServerMeta } from './types'
import { Meta } from './meta'
type Construct<T = any> = new (...args: Array<any>) => T

export function Factory<T>(Modules: Construct<T>[]) {
  const moduleMap = new Map<string, InstanceType<Construct>>()
  const meta: Meta[] = []
  Modules.forEach(Module => buildNestModule(Module, moduleMap, meta) as InstanceType<Construct<T>>)
  return { moduleMap, meta }
}

function buildNestModule(Module: Construct, map: Map<string, InstanceType<Construct>>, meta: Meta[]) {
  const paramtypes = getParamtypes(Module) as Construct[]
  let instance: InstanceType<Construct>
  const name = Module.name
  if (map.has(name)) {
    instance = map.get(name)
    if (!instance)
      throw new Error(`exist Circular Module dep--${Module}`)
    return instance
  }
  map.set(name, undefined)
  if (paramtypes) {
    instance = new Module(...paramtypes.map(item =>
      buildNestModule(item, map, meta),
    ))
  }
  else {
    instance = new Module()
  }
  meta.push(...getMetaFromInstance(instance, name))
  map.set(name, instance)

  return instance
}

function getMetaFromInstance(instance: Phecda, name: string) {
  const vars = getModelState(instance).filter(item => item !== '__CLASS')
  const baseState = (getState(instance, '__CLASS') || {}) as Partial<ServerMeta>
  return vars.map((i) => {
    const state = getState(instance, i) as Partial<ServerMeta>
    if (baseState.route && state.route)
      state.route.route = baseState.route.route + state.route.route
    state.name = name
    state.method = i
    const params = [] as any[]
    for (const i of state.params || []) {
      params.unshift(i)
      if (i.index === 0)
        break
    }
    state.params = params
    return new Meta(state as unknown as ServerMeta, getParamtypes(instance, i))
  })
}

function getParamtypes(Module: any, key?: string | symbol) {
  return Reflect.getMetadata('design:paramtypes', Module, key!)
}
