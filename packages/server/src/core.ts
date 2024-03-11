import 'reflect-metadata'
import fs from 'fs'
import EventEmitter from 'node:events'
import type { Construct, Phecda } from 'phecda-core'
import { Empty, SHARE_KEY, getExposeKey, getHandler, getProperty, getState, getTag, injectProperty, isPhecda, registerSerial, unmountParallel } from 'phecda-core'
import Debug from 'debug'
import type { Emitter, P } from './types'
import { Meta } from './meta'
import { log } from './utils'
import { IS_DEV } from './common'
import { generateHTTPCode, generateRPCCode } from './compiler'
export function Injectable() {
  return (target: any) => Empty(target)
}
const debug = Debug('phecda-server')
// TODO: support both emitter types and origin emitter type in future
export const emitter: Emitter = new EventEmitter() as any

export async function Factory(Modules: (new (...args: any) => any)[], opts: {

  // HTTP generate code path
  http?: string
  // rpc generate code path
  rpc?: string
} = {}) {
  const moduleMap = new Map<PropertyKey, InstanceType<Construct>>()
  const meta: Meta[] = []
  const constructorMap = new Map()

  // only work for warn
  const constructorSet = new WeakSet()
  const moduleGraph = new Map<PropertyKey, Set<PropertyKey>>()
  const { http, rpc } = opts

  if (!getProperty('watcher')) {
    injectProperty('watcher', ({ eventName, instance, key, options }: { eventName: string; instance: any; key: string; options?: { once: boolean } }) => {
      const fn = typeof instance[key] === 'function' ? instance[key].bind(instance) : (v: any) => instance[key] = v

      if (options?.once)
        (emitter as any).once(eventName, fn)

      else
        (emitter as any).on(eventName, fn)

      return () => {
        (emitter as any).off(eventName, fn)
      }
    })
  }

  // only remove module in moduleMap(won't remove indirect module)
  async function del(tag: PropertyKey) {
    if (!moduleMap.has(tag))
      return

    const instance = moduleMap.get(tag)

    debug(`unmount module "${String(tag)}"`)

    unmountParallel(instance)
    debug(`del module "${String(tag)}"`)

    moduleMap.delete(tag)
    constructorMap.delete(tag)
    for (let i = meta.length - 1; i >= 0; i--) {
      if (meta[i].data.tag === tag)
        meta.splice(i, 1)
    }

    return instance
  }

  async function destroy() {
    debug('destroy all')

    for (const [tag] of moduleMap)
      await del(tag)
  }

  async function add(Module: Construct) {
    const tag = Module.prototype?.__TAG__ || Module.name
    const oldInstance = await del(tag)

    const { instance: newModule } = await buildNestModule(Module)

    if (oldInstance && moduleGraph.has(tag)) {
      debug(`replace module "${tag}"`);

      [...moduleGraph.get(tag)!].forEach((tag) => {
        const module = moduleMap.get(tag)
        for (const key in module) {
          if (module[key] === oldInstance)
            module[key] = newModule
        }
      })
    }
  }
  async function buildNestModule(Module: Construct) {
    const paramtypes = getParamTypes(Module) as Construct[]
    let instance: InstanceType<Construct>
    const tag = getTag(Module)
    if (moduleMap.has(tag)) {
      instance = moduleMap.get(tag)
      if (!instance)
        throw new Error(`exist Circular-Dependency or Multiple modules with the same name/tag [tag] ${String(tag)}--[module] ${Module}`)

      if (constructorMap.get(tag) !== Module && !constructorSet.has(Module)) {
        constructorSet.add(Module)// a module will only warn once
        log(`Synonym module: Module taged "${String(tag)}" has been loaded before, so phecda-server won't load Module "${Module.name}"`, 'warn')
      }
      return { instance, tag }
    }
    moduleMap.set(tag, undefined)
    debug(`instantiate module "${String(tag)}"`)

    if (paramtypes) {
      const paramtypesInstances = [] as any[]
      for (const i in paramtypes) {
        const { instance: sub, tag: subTag } = await buildNestModule(paramtypes[i])
        paramtypesInstances[i] = sub
        if (!moduleGraph.has(subTag))
          moduleGraph.set(subTag, new Set())
        moduleGraph.get(subTag)!.add(tag)
      }

      instance = new Module(...paramtypesInstances)
    }
    else {
      instance = new Module()
    }
    meta.push(...getMetaFromInstance(instance, tag, Module.name))

    debug(`init module "${String(tag)}"`)

    await registerSerial(instance)

    debug(`add module "${String(tag)}"`)

    moduleMap.set(tag, instance)
    constructorMap.set(tag, Module)
    return { instance, tag }
  }

  for (const Module of Modules)
    await buildNestModule(Module)

  function writeCode() {
    if (http) {
      debug(`write http code to ${http}`)
      fs.promises.writeFile(http, generateHTTPCode(meta.map(item => item.data)))
    }
    if (rpc) {
      debug(`write rpc code to ${rpc}`)

      fs.promises.writeFile(rpc, generateRPCCode(meta.map(item => item.data)))
    }
  }

  writeCode()
  if (IS_DEV) {
    if (!globalThis.__PS_HMR__)
      globalThis.__PS_HMR__ = []

    globalThis.__PS_HMR__?.push(async (files: string[]) => {
      debug('reload files ')

      for (const file of files) {
        const module = await import(file)
        for (const i in module) {
          if (isPhecda(module[i]))
            await add(module[i])
        }
      }
      writeCode()
    })
  }

  return {
    moduleMap,
    meta,
    constructorMap,
    add,
    del,
    destroy,
  }
}

function getMetaFromInstance(instance: Phecda, tag: PropertyKey, name: string) {
  const vars = getExposeKey(instance).filter(item => item !== SHARE_KEY)
  const baseState = (getState(instance, SHARE_KEY) || {}) as P.MetaData
  initState(baseState)

  return vars.map((i) => {
    const meta = {} as P.MetaData
    const state = (getState(instance, i) || {}) as P.MetaData
    initState(state)
    if (state.http) {
      meta.http = {
        route: (baseState.http?.route || '') + (state.http.route),
        type: state.http.type,
      }
    }
    if (baseState.rpc)
      meta.rpc = baseState.rpc
    if (state.rpc) {
      meta.rpc = {
        ...meta.rpc,
        ...state.rpc,
      }
    }

    if (typeof tag !== 'string' && (meta.rpc || meta.http))
      log(`can't use Tag with ${typeof tag} on http/rpc controller "${(instance as any).constructor.name}",instead with "${tag = String(tag)}"`, 'error')

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
    meta.filter = state.filter || baseState.filter
    meta.define = { ...baseState.define, ...state.define }
    meta.header = { ...baseState.header, ...state.header }
    meta.plugins = [...new Set([...baseState.plugins, ...state.plugins])]
    meta.guards = [...new Set([...baseState.guards, ...state.guards])]
    meta.interceptors = [...new Set([...baseState.interceptors, ...state.interceptors])]

    return new Meta(meta as unknown as P.MetaData, getHandler(instance, i), getParamTypes(instance, i as string) || [])
  })
}

function getParamTypes(Module: any, key?: string | symbol) {
  return Reflect.getMetadata('design:paramtypes', Module, key!)
}

function initState(state: any) {
  if (!state.define)
    state.define = {}
  if (!state.header)
    state.header = {}
  if (!state.plugins)
    state.plugins = []
  if (!state.guards)
    state.guards = []
  if (!state.interceptors)
    state.interceptors = []
}
