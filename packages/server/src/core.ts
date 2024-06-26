import 'reflect-metadata'
import EventEmitter from 'node:events'
import type { Construct, Phecda, WatcherParam } from 'phecda-core'
import { getExposeKey, getInject, getState, getTag, invokeHandler, isPhecda, setInject } from 'phecda-core'
import Debug from 'debug'
import type { Emitter } from './types'
import type { MetaData } from './meta'
import { Meta } from './meta'
import { log } from './utils'
import { IS_HMR, IS_ONLY_GENERATE } from './common'
import type { Generator } from './generator'

const debug = Debug('phecda-server(Factory)')
// TODO: support both emitter types and origin emitter type in future
export const emitter: Emitter = new EventEmitter() as any

export async function Factory(models: (new (...args: any) => any)[], opts: {
  parseModule?: (module: any) => any
  parseMeta?: (meta: Meta) => Meta | null | undefined
  generators?: Generator[]
} = {}) {
  const moduleMap = new Map<PropertyKey, InstanceType<Construct>>()
  const meta: Meta[] = []
  const constructorMap = new Map()
  const constructorSet = new WeakSet()
  const dependenceGraph = new Map<PropertyKey, Set<PropertyKey>>()
  const { parseModule = (module: any) => module, parseMeta = (meta: any) => meta, generators } = opts
  if (!getInject('watcher')) {
    setInject('watcher', ({ eventName, instance, key, options }: WatcherParam) => {
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
    await invokeHandler('unmount', instance)
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

  async function add(Model: Construct) {
    const tag = getTag(Model)
    const oldInstance = await del(tag)

    const { instance: newModule } = await buildDepModule(Model)

    if (oldInstance && dependenceGraph.has(tag)) {
      debug(`replace module "${String(tag)}"`);

      [...dependenceGraph.get(tag)!].forEach((tag) => {
        const module = moduleMap.get(tag)
        for (const key in module) {
          if (module[key] === oldInstance)
            module[key] = newModule
        }
      })
    }
  }

  async function buildDepModule(Model: Construct) {
    const paramtypes = getParamTypes(Model) as Construct[]
    let instance: InstanceType<Construct>
    const tag = getTag(Model)

    if (moduleMap.has(tag)) {
      instance = moduleMap.get(tag)
      if (!instance)
        throw new Error(`exist Circular-Dependency or Multiple modules with the same name/tag [tag] ${String(tag)}--[module] ${Model}`)

      if (constructorMap.get(tag) !== Model && !constructorSet.has(Model)) {
        constructorSet.add(Model)// a module will only warn once

        if (instance instanceof Model)
          log(`Module taged ${String(tag)} has been overridden`)// legal override
        else
          log(`Synonym module: Module taged "${String(tag)}" has been loaded before, so phecda-server won't load Module "${Model.name}"`, 'warn')
      }
      return { instance, tag }
    }
    moduleMap.set(tag, undefined)
    debug(`instantiate module "${String(tag)}"`)

    if (paramtypes) {
      const paramtypesInstances = [] as any[]
      for (const i in paramtypes) {
        const { instance: sub, tag: subTag } = await buildDepModule(paramtypes[i])
        paramtypesInstances[i] = sub
        if (!dependenceGraph.has(subTag))
          dependenceGraph.set(subTag, new Set())
        dependenceGraph.get(subTag)!.add(tag)
      }

      instance = parseModule(new Model(...paramtypesInstances))
    }
    else {
      instance = parseModule(new Model())
    }
    meta.push(...getMetaFromInstance(instance, tag, Model.name).map(parseMeta).filter(item => !!item))

    debug(`init module "${String(tag)}"`)

    if (!IS_ONLY_GENERATE)
      await invokeHandler('init', instance)

    debug(`add module "${String(tag)}"`)

    moduleMap.set(tag, instance)
    constructorMap.set(tag, Model)
    return { instance, tag }
  }

  for (const model of models)
    await buildDepModule(model)

  async function generateCode() {
    if (generators) {
      return Promise.all(generators.map((generator) => {
        debug(`generate "${generator.name}" code to ${generator.path}`)

        return generator.output(meta)
      }))
    }
  }

  generateCode().then(() => {
    if (IS_ONLY_GENERATE)
      process.exit(4)// only output code/work for ci
  })

  if (IS_HMR) { // for hmr
    if (!globalThis.__PS_HMR__)
      globalThis.__PS_HMR__ = []

    globalThis.__PS_HMR__?.push(async (files: string[]) => {
      debug('reload files ')

      for (const file of files) {
        const models = await import(file)
        for (const i in models) {
          if (isPhecda(models[i]))
            await add(models[i])
        }
      }
      generateCode()
    })
  }

  return {
    moduleMap,
    constructorMap,
    meta,
    add,
    del,
    destroy,
  }
}

function getMetaFromInstance(instance: Phecda, tag: PropertyKey, name: string) {
  const vars = getExposeKey(instance).filter(item => typeof item === 'string') as string[]
  const baseState = getState(instance) as MetaData
  initState(baseState)

  const ctxs = getState(instance).ctxs

  return vars.filter(i => typeof (instance as any)[i] === 'function').map((i) => {
    const state = getState(instance, i) as any

    const meta = {
      ...state,
      name,
      tag,
      func:
        i,
    } as MetaData
    if (baseState.controller) {
      if (typeof tag !== 'string')
        log(`can't use Tag with ${typeof tag} on controller "${(instance as any).constructor.name}",instead with "${tag = String(tag)}"`, 'error')
      initState(state)
      meta.controller = baseState.controller
      meta[baseState.controller] = {
        ...baseState[baseState.controller],
        ...state[baseState.controller],
      }

      const params = [] as any[]
      for (const i of state.params || []) {
        if (!i.pipe)
          i.pipe = state.pipe || baseState.pipe
        if (!i.define)
          i.define = {}

        params.unshift(i)
        if (i.index === 0)
          break
      }

      meta.ctxs = ctxs
      meta.params = params
      meta.filter = state.filter || baseState.filter
      meta.define = { ...baseState.define, ...state.define }
      meta.plugins = [...new Set([...baseState.plugins, ...state.plugins])]
      meta.guards = [...new Set([...baseState.guards, ...state.guards])]
      meta.interceptors = [...new Set([...baseState.interceptors, ...state.interceptors])]
    }
    return new Meta(meta as unknown as MetaData, getParamTypes(instance, i as string) || [])
  })
}

function getParamTypes(Model: any, key?: string | symbol) {
  return Reflect.getMetadata('design:paramtypes', Model, key!)
}

function initState(state: any) {
  if (!state.define)
    state.define = {}

  if (!state.plugins)
    state.plugins = new Set()
  if (!state.guards)
    state.guards = new Set()
  if (!state.interceptors)
    state.interceptors = new Set()
}
