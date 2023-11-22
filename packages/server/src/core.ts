import 'reflect-metadata'
import fs from 'fs'
import EventEmitter from 'node:events'
import type { Phecda } from 'phecda-core'
import { getExposeKey, getHandler, getState, injectProperty, isPhecda, registerAsync } from 'phecda-core'
import type { Construct, Emitter, P } from './types'
import { Meta } from './meta'
import { warn } from './utils'
import { UNMOUNT_SYMBOL } from './common'
// TODO: support both emitter types and origin emitter type in future
export const emitter: Emitter = new EventEmitter() as any

export async function Factory(Modules: (new (...args: any) => any)[], opts: {
  dev?: boolean
  file?: string
} = {}) {
  const moduleMap = new Map<string, InstanceType<Construct>>()
  const meta: Meta[] = []
  const constructorMap = new Map()
  const moduleGraph = new WeakMap()
  const { dev = process.env.NODE_ENV === 'development', file = 'pmeta.js' } = opts
  injectProperty('watcher', ({ eventName, instance, key, options }: { eventName: string; instance: any; key: string; options?: { once: boolean } }) => {
    const fn = typeof instance[key] === 'function' ? instance[key].bind(instance) : (v: any) => instance[key] = v

    if (options?.once)
      (emitter as any).once(eventName, fn)

    else
      (emitter as any).on(eventName, fn)
  })

  async function update(Module: Construct) {
    const tag = Module.prototype?.__TAG__ || Module.name
    console.log('update', tag)
    if (!moduleMap.has(tag))
      return

    const instance = moduleMap.get(tag)

    if (instance?.[UNMOUNT_SYMBOL]) {
      for (const cb of instance[UNMOUNT_SYMBOL])
        await cb()
    }
    moduleMap.delete(tag)
    constructorMap.delete(tag)
    for (let i = meta.length - 1; i >= 0; i--) {
      if (meta[i].data.tag === tag)
        meta.splice(i, 1)
    }
    const newModule = await buildNestModule(Module, moduleMap)
    moduleGraph.get(instance)?.forEach((module: any) => {
      for (const key in module) {
        if (module[key] === instance)
          module[key] = newModule
      }
    })
    moduleGraph.get(instance)
    moduleMap.set(tag, newModule)
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
      for (const i of paramtypesInstances) {
        if (!moduleGraph.has(i))
          moduleGraph.set(i, [])
        moduleGraph.get(i).push(instance)
      }
    }
    else {
      instance = new Module()
    }
    meta.push(...getMetaFromInstance(instance, tag, Module.name))
    await registerAsync(instance)
    map.set(tag, instance)
    constructorMap.set(tag, Module)
    return instance
  }

  for (const Module of Modules)
    await buildNestModule(Module, moduleMap)

  function writeMeta() {
    fs.promises.writeFile(file, JSON.stringify(meta.map(item => item.data)))
  }

  writeMeta()
  if (dev) {
    // @ts-expect-error globalThis
    globalThis.__PHECDA_SERVER_HMR__ = async (file: string) => {
      console.log('hmr', file)
      const module = await import(file)
      for (const i in module) {
        if (isPhecda(module[i]))
          await update(module[i])
      }
    }
    // @ts-expect-error globalThis
    globalThis.__PHECDA_SERVER_META__ = writeMeta
  }

  return {
    moduleMap,
    meta,
    constructorMap,
    update,
  }
}

function getMetaFromInstance(instance: Phecda, tag: string, name: string) {
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
    meta.name = name
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

export class Dev {
  [UNMOUNT_SYMBOL]: (() => void)[] = []
  onUnmount(cb: () => void) {
    this[UNMOUNT_SYMBOL].push(cb)
  }
}
