import 'reflect-metadata'
import type { Phecda } from 'phecda-core'
import { getModelState, getState } from 'phecda-core'

import type { ServerMeta } from './types'
type Construct<T = any> = new (...args: Array<any>) => T

export function Factory<T>(Modules: Construct<T>[]) {
  const moduleMap = new Map<string, InstanceType<Construct>>()
  const meta: ServerMeta[] = []
  Modules.forEach(Module => buildNestModule(Module, moduleMap, meta) as InstanceType<Construct<T>>)
  console.log(meta[0].params)
  return { moduleMap, meta }
}

function buildNestModule(Module: Construct, map: Map<string, InstanceType<Construct>>, meta: ServerMeta[]) {
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
  const baseState = getState(instance, '__CLASS') || {} as any
  return vars.map((i) => {
    const state = getState(instance, i) as any
    if (baseState.route && !baseState.route.type)
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
    return state
  }) as unknown as ServerMeta[]
}

function getParamtypes(Module: Construct) {
  return Reflect.getMetadata('design:paramtypes', Module)
}
