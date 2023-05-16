import 'reflect-metadata'
import EventEmitter from 'events'
import fs from 'fs'
import type { Phecda } from 'phecda-core'
import { getExposeKey, getHandler, getState, injectProperty, registerAsync } from 'phecda-core'
import type { Construct, PhecdaEmitter, ServerMeta } from './types'
import { Pmeta } from './meta'
// TODO: support both phecda-emitter types and origin emitter type in future
export const emitter: PhecdaEmitter = new EventEmitter() as any

export async function Factory(Modules: (new (...args: any) => any)[]) {
  const moduleMap = new Map<string, InstanceType<Construct>>()
  const meta: Pmeta[] = []
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

async function buildNestModule(Module: Construct, map: Map<string, InstanceType<Construct>>, meta: Pmeta[]) {
  const paramtypes = getParamtypes(Module) as Construct[]
  let instance: InstanceType<Construct>
  const name = Module.prototype?.__TAG__ || Module.name
  if (map.has(name)) {
    instance = map.get(name)
    if (!instance)
      throw new Error(`exist Circular Module dep--${Module}`)

    return instance
  }
  map.set(name, undefined)
  if (paramtypes) {
    for (const i in paramtypes)
      paramtypes[i] = await buildNestModule(paramtypes[i], map, meta)

    instance = new Module(...paramtypes)
  }
  else {
    instance = new Module()
  }
  meta.push(...getMetaFromInstance(instance, Module.name))
  await registerAsync(instance)
  map.set(name, instance)

  return instance
}

function getMetaFromInstance(instance: Phecda, name: string) {
  const vars = getExposeKey(instance).filter(item => item !== '__CLASS')
  const baseState = (getState(instance, '__CLASS') || {}) as ServerMeta
  initState(baseState)
  return vars.map((i) => {
    const state = (getState(instance, i) || {}) as ServerMeta
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
    initState(state)
    state.header = Object.assign({}, baseState.header, state.header)
    state.middlewares = [...new Set([...baseState.middlewares, ...state.middlewares])]
    state.guards = [...new Set([...baseState.guards, ...state.guards])]
    state.interceptors = [...new Set([...baseState.interceptors, ...state.interceptors])]

    return new Pmeta(state as unknown as ServerMeta, getHandler(instance, i), getParamtypes(instance, i) || [])
  })
}

function getParamtypes(Module: any, key?: string | symbol) {
  return Reflect.getMetadata('design:paramtypes', Module, key!)
}

function initState(state: any) {
  if (!state.header)
    state.header = {}
  if (!state.middlewares)
    state.middlewares = []
  if (!state.guards)
    state.guards = []
  if (!state.interceptors)
    state.interceptors = []
}
