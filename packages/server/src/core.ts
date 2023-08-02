import 'reflect-metadata'
import fs from 'fs'
import EventEmitter from 'node:events'
import type { Phecda } from 'phecda-core'
import { getExposeKey, getHandler, getState, injectProperty, registerAsync } from 'phecda-core'
import type { Construct, Emitter, P } from './types'
import { Meta } from './meta'
// TODO: support both emitter types and origin emitter type in future
export const emitter: Emitter = new EventEmitter() as any

export async function Factory(Modules: (new (...args: any) => any)[]) {
  const moduleMap = new Map<string, InstanceType<Construct>>()
  const meta: Meta[] = []
  injectProperty('watcher', ({ eventName, instance, key, options }: { eventName: string; instance: any; key: string; options?: { once: boolean } }) => {
    const fn = typeof instance[key] === 'function' ? instance[key].bind(instance) : (v: any) => instance[key] = v

    if (options?.once)
      (emitter as any).once(eventName, fn)

    else
      (emitter as any).on(eventName, fn)
  })

  for (const Module of Modules)
    await buildNestModule(Module, moduleMap, meta)

  return { moduleMap, meta, output: (p = 'pmeta.js') => fs.writeFileSync(p, JSON.stringify(meta.map(item => item.data))) }
}

async function buildNestModule(Module: Construct, map: Map<string, InstanceType<Construct>>, meta: Meta[]) {
  const paramtypes = getParamtypes(Module) as Construct[]
  let instance: InstanceType<Construct>
  const tag = Module.prototype?.__TAG__ || Module.name
  if (map.has(tag)) {
    instance = map.get(tag)
    if (!instance)
      throw new Error(`exist Circular-Dependency or Multiple modules with the same name/tag [tag] ${tag}--[module] ${Module}`)

    return instance
  }
  map.set(tag, undefined)
  if (paramtypes) {
    const paramtypesInstances = [] as any[]
    for (const i in paramtypes)
      paramtypesInstances[i] = await buildNestModule(paramtypes[i], map, meta)

    instance = new Module(...paramtypesInstances)
  }
  else {
    instance = new Module()
  }
  meta.push(...getMetaFromInstance(instance, Module.name, tag))
  await registerAsync(instance)
  map.set(tag, instance)

  return instance
}

function getMetaFromInstance(instance: Phecda, name: string, tag: string) {
  const vars = getExposeKey(instance).filter(item => item !== '__CLASS')
  const baseState = (getState(instance, '__CLASS') || {}) as P.Meta
  initState(baseState)
  return vars.map((i) => {
    const state = (getState(instance, i) || {}) as P.Meta
    if (baseState.route && state.route)
      state.route.route = baseState.route.route + state.route.route
    state.name = name
    state.tag = tag
    state.method = i
    const params = [] as any[]
    for (const i of state.params || []) {
      params.unshift(i)
      if (i.index === 0)
        break
    }
    state.params = params
    initState(state)
    state.define = { ...baseState.define, ...state.define }
    state.header = { ...baseState.header, ...state.header }
    state.middlewares = [...new Set([...baseState.middlewares, ...state.middlewares])]
    state.guards = [...new Set([...baseState.guards, ...state.guards])]
    state.interceptors = [...new Set([...baseState.interceptors, ...state.interceptors])]

    return new Meta(state as unknown as P.Meta, getHandler(instance, i), getParamtypes(instance, i) || [])
  })
}

function getParamtypes(Module: any, key?: string | symbol) {
  return Reflect.getMetadata('design:paramtypes', Module, key!)
}

function initState(state: any) {
  if (!state.define)
    state.define = {}
  if (!state.header)
    state.header = {}
  if (!state.middlewares)
    state.middlewares = []
  if (!state.guards)
    state.guards = []
  if (!state.interceptors)
    state.interceptors = []
}
