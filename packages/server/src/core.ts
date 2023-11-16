import 'reflect-metadata'
import fs from 'fs'
import EventEmitter from 'node:events'
import type { Phecda } from 'phecda-core'
import { getExposeKey, getHandler, getState, injectProperty, registerAsync } from 'phecda-core'
import type { Construct, Emitter, P } from './types'
import { Meta } from './meta'
import { warn } from './utils'
import { UPDATE_SYMBOL } from './common'
// TODO: support both emitter types and origin emitter type in future
export const emitter: Emitter = new EventEmitter() as any

export async function Factory(Modules: (new (...args: any) => any)[], opts: {
  proxy?: boolean
  file?: string
} = {}) {
  const moduleMap = new Map<string, InstanceType<Construct>>()
  let meta: Meta[] = []
  const constructorMap = new Map()
  const { proxy = process.env.NODE_ENV === 'development', file = 'pmeta.js' } = opts
  injectProperty('watcher', ({ eventName, instance, key, options }: { eventName: string; instance: any; key: string; options?: { once: boolean } }) => {
    const fn = typeof instance[key] === 'function' ? instance[key].bind(instance) : (v: any) => instance[key] = v

    if (options?.once)
      (emitter as any).once(eventName, fn)

    else
      (emitter as any).on(eventName, fn)
  })

  function update(moduleMap: Map<string, any>, tag: string, Module: Construct) {
    if (moduleMap.has(tag)) {
      meta = meta.filter(item => item.data.tag !== tag)
      moduleMap.get(tag)[UPDATE_SYMBOL] = buildNestModule(Module, moduleMap)
      writeMeta()
    }
  }
  async function buildNestModule(Module: Construct, map: Map<string, InstanceType<Construct>>) {
    const paramtypes = getParamtypes(Module) as Construct[]
    let instance: InstanceType<Construct>
    const tag = Module.prototype?.__TAG__ || Module.name
    if (map.has(tag)) {
      instance = map.get(tag)
      if (!instance)
        throw new Error(`exist Circular-Dependency or Multiple modules with the same name/tag [tag] ${tag}--[module] ${Module}`)

      if (constructorMap.get(tag) !== Module)
        warn(`Synonym module: Module taged "${tag}" has been loaded before, so phecda-server won't load Module "${Module.name}"`)

      return instance
    }
    map.set(tag, undefined)
    if (paramtypes) {
      const paramtypesInstances = [] as any[]
      for (const i in paramtypes)
        paramtypesInstances[i] = await buildNestModule(paramtypes[i], map)

      instance = new Module(...paramtypesInstances)
    }
    else {
      instance = new Module()
    }
    meta.push(...getMetaFromInstance(instance, tag))
    await registerAsync(instance)
    map.set(tag, proxy ? createProxyModule(instance) : instance)
    constructorMap.set(tag, Module)
    return instance
  }

  for (const Module of Modules)
    await buildNestModule(Module, moduleMap)

  function writeMeta() {
    fs.promises.writeFile(file, JSON.stringify(meta.map(item => item.data)))
  }

  writeMeta()

  if (proxy)
  // @ts-expect-error miss types
    globalThis.PHECDA_SERVER_HMR = update

  return {
    moduleMap,
    meta,
    constructorMap,
    update,
  }
}

function createProxyModule(module: any) {
  return new Proxy({ module }, {
    get(target, p) {
      return target.module![p]
    },
    has(target, p) {
      return p in target.module
    },
    set(target, p, v) {
      if (p === UPDATE_SYMBOL)
        return target.module = v

      else
        return target.module[p] = v
    },

  })
}

function getMetaFromInstance(instance: Phecda, tag: string) {
  const vars = getExposeKey(instance).filter(item => item !== '__CLASS')
  const baseState = (getState(instance, '__CLASS') || {}) as P.Meta
  initState(baseState)

  return vars.map((i) => {
    const meta = {} as P.Meta
    const state = (getState(instance, i) || {}) as P.Meta
    initState(state)
    if (state.route) {
      meta.route = {
        route: (baseState.route?.route || '') + (state.route.route),
        type: state.route.type,
      }
    }

    meta.tag = tag
    meta.method = i as string
    const params = [] as any[]
    for (const i of state.params || []) {
      params.unshift(i)
      if (i.index === 0)
        break
    }
    meta.params = params
    meta.define = { ...baseState.define, ...state.define }
    meta.header = { ...baseState.header, ...state.header }
    meta.middlewares = [...new Set([...baseState.middlewares, ...state.middlewares])]
    meta.guards = [...new Set([...baseState.guards, ...state.guards])]
    meta.interceptors = [...new Set([...baseState.interceptors, ...state.interceptors])]

    return new Meta(meta as unknown as P.Meta, getHandler(instance, i), getParamtypes(instance, i as string) || [])
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
