import 'reflect-metadata'
import fs from 'fs'
import EventEmitter from 'node:events'
import type { Phecda } from 'phecda-core'
import { Empty, getExposeKey, getHandler, getState, injectProperty, isPhecda, registerAsync } from 'phecda-core'
import Debug from 'debug'
import pc from 'picocolors'
import type { Construct, Emitter, P } from './types'
import { Meta } from './meta'
import { log } from './utils'
import { IS_DEV, UNMOUNT_SYMBOL } from './common'
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
  const moduleMap = new Map<string, InstanceType<Construct>>()
  const meta: Meta[] = []
  const constructorMap = new Map()

  // only work for warn
  const constructorSet = new WeakSet()
  const moduleGraph = new Map<string, Set<string>>()
  const { http, rpc } = opts
  injectProperty('watcher', ({ eventName, instance, key, options }: { eventName: string; instance: any; key: string; options?: { once: boolean } }) => {
    const fn = typeof instance[key] === 'function' ? instance[key].bind(instance) : (v: any) => instance[key] = v


    // work for hmr
    instance[UNMOUNT_SYMBOL]?.push(()=>{
      emitter.off(eventName as any,fn)
    })

    if (options?.once)
      (emitter as any).once(eventName, fn)

    else
      (emitter as any).on(eventName, fn)
  })

  async function update(Module: Construct) {
    const tag = Module.prototype?.__TAG__ || Module.name
    if (!moduleMap.has(tag))
      return
    debug(`update module "${tag}"`)

    const instance = moduleMap.get(tag)

    if (instance?.[UNMOUNT_SYMBOL]) {
      for (const cb of instance[UNMOUNT_SYMBOL])
        await cb()
    }
    log(`Module ${pc.yellow(`[${tag}]`)} unmount`)
    moduleMap.delete(tag)
    constructorMap.delete(tag)
    for (let i = meta.length - 1; i >= 0; i--) {
      if (meta[i].data.tag === tag)
        meta.splice(i, 1)
    }

    const { instance: newModule } = await buildNestModule(Module)
    if (moduleGraph.has(tag)) {
      [...moduleGraph.get(tag)!].forEach((tag) => {
        const module = moduleMap.get(tag)
        for (const key in module) {
          if (module[key] === instance)
            module[key] = newModule
        }
      })
    }

    moduleMap.set(tag, newModule)
  }
  async function buildNestModule(Module: Construct) {
    const paramtypes = getParamTypes(Module) as Construct[]
    let instance: InstanceType<Construct>
    const tag = Module.prototype?.__TAG__ || Module.name
    if (moduleMap.has(tag)) {
      instance = moduleMap.get(tag)
      if (!instance)
        throw new Error(`exist Circular-Dependency or Multiple modules with the same name/tag [tag] ${tag}--[module] ${Module}`)

      if (constructorMap.get(tag) !== Module && !constructorSet.has(Module)) {
        constructorSet.add(Module)// a module will only warn once
        log(`Synonym module: Module taged "${tag}" has been loaded before, so phecda-server won't load Module "${Module.name}"`, 'warn')
      }
      return { instance, tag }
    }
    moduleMap.set(tag, undefined)
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
    await registerAsync(instance)
    moduleMap.set(tag, instance)
    log(`Module ${pc.yellow(`[${tag}]`)} mount"`)
    constructorMap.set(tag, Module)
    return { instance, tag }
  }

  for (const Module of Modules)
    await buildNestModule(Module)

  function writeCode() {
    debug('write code')

    http && fs.promises.writeFile(http, generateHTTPCode(meta.map(item => item.data)))
    rpc && fs.promises.writeFile(rpc, generateRPCCode(meta.map(item => item.data)))
  }

  writeCode()
  if (IS_DEV) {
    // @ts-expect-error globalThis
    globalThis.__PS_HMR__ = async (file: string) => {
      debug(`reload file ${file}`)
      const module = await import(file)
      for (const i in module) {
        if (isPhecda(module[i]))
          await update(module[i])
      }
    }
    // @ts-expect-error globalThis
    globalThis.__PS_WRITEMETA__ = writeCode
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
    meta.plugins = [...new Set([...baseState.plugins, ...state.plugins])]
    meta.guards = [...new Set([...baseState.guards, ...state.guards])]
    meta.interceptors = [...new Set([...baseState.interceptors, ...state.interceptors])]

    return new Meta(meta as unknown as P.Meta, getHandler(instance, i), getParamTypes(instance, i as string) || [])
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
