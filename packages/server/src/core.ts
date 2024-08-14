import 'reflect-metadata'
import EventEmitter from 'node:events'
import type { Construct, Phecda, WatcherParam } from 'phecda-core'
import { getExposeKey, getInject, getMeta, getTag, invokeHandler, isPhecda, setInject } from 'phecda-core'
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
export interface Options {
  parseModule?: (module: any) => any
  parseMeta?: (meta: Meta) => Meta | null | undefined
  generators?: Generator[]
}

export async function Factory(models: Construct[], opts: Options = {}) {
  const moduleMap = new Map<PropertyKey, InstanceType<Construct>>()
  const meta: Meta[] = []
  const modelMap = new WeakMap<InstanceType<Construct>, Construct>()
  const modelSet = new WeakSet<Construct>()
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

    const module = moduleMap.get(tag)

    debug(`unmount module "${String(tag)}"`)
    await invokeHandler('unmount', module)
    debug(`del module "${String(tag)}"`)

    moduleMap.delete(tag)
    modelMap.delete(module)
    for (let i = meta.length - 1; i >= 0; i--) {
      if (meta[i].data.tag === tag)
        meta.splice(i, 1)
    }
    return module
  }

  async function destroy() {
    debug('destroy all')

    for (const [tag] of moduleMap)
      await del(tag)
  }

  async function add(Model: Construct) {
    const tag = getTag(Model)

    const oldInstance = await del(tag)
    const { module: newModule } = await buildDepModule(Model)

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
    let module: InstanceType<Construct>
    const tag = getTag(Model)

    if (moduleMap.has(tag)) {
      module = moduleMap.get(tag)
      if (!module)
        throw new Error(`exist Circular-Dependency or Multiple modules with the same name/tag [tag] ${String(tag)}--[module] ${Model}`)

      if (modelMap.get(module) !== Model && !modelSet.has(Model)) {
        modelSet.add(Model)// a module will only warn once

        if (module instanceof Model)
          log(`Module taged ${String(tag)} has been overridden`)// legal override
        else
          log(`Synonym module: Module taged "${String(tag)}" has been loaded before, so phecda-server won't load Module "${Model.name}"`, 'warn')
      }
      return { module, tag }
    }
    moduleMap.set(tag, undefined)
    debug(`instantiate module "${String(tag)}"`)

    if (paramtypes) {
      const paramtypesInstances = [] as any[]
      for (const i in paramtypes) {
        const { module: sub, tag: subTag } = await buildDepModule(paramtypes[i])
        paramtypesInstances[i] = sub
        if (!dependenceGraph.has(subTag))
          dependenceGraph.set(subTag, new Set())
        dependenceGraph.get(subTag)!.add(tag)
      }

      module = parseModule(new Model(...paramtypesInstances))
    }
    else {
      module = parseModule(new Model())
    }
    meta.push(...getMetaFromInstance(module, tag, Model.name).map(parseMeta).filter(item => !!item))

    debug(`init module "${String(tag)}"`)

    if (!IS_ONLY_GENERATE)
      await invokeHandler('init', module)

    debug(`add module "${String(tag)}"`)

    moduleMap.set(tag, module)
    modelMap.set(module, Model)
    return { module, tag }
  }

  for (const model of models)
    await buildDepModule(model)

  async function generateCode() {
    if (generators && IS_HMR) {
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
    modelMap,
    meta,
    add,
    del,
    destroy,
  }
}

function getMetaFromInstance(instance: Phecda, tag: PropertyKey, name: string) {
  const vars = getExposeKey(instance).filter(item => typeof item === 'string') as string[]
  const baseState = getMeta(instance) as MetaData
  initState(baseState)

  const ctxs = getMeta(instance).ctxs

  return vars.filter(i => typeof (instance as any)[i] === 'function').map((i) => {
    const state = getMeta(instance, i) as any

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
      for (const item of state.params || []) {
        const newItem = { ...item }
        if (!newItem.pipe)
          newItem.pipe = state.pipe || baseState.pipe
        if (!newItem.define)
          newItem.define = {}

        params.unshift(newItem)
        if (item.index === 0)
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
    return new Meta(deepFreeze(meta as unknown as MetaData), getParamTypes(instance, i as string) || [])
  })
}

function deepFreeze<T extends Record<string, any>>(object: T): T {
  // 先冻结对象本身
  Object.freeze(object)

  // 获取对象的所有属性名
  Object.getOwnPropertyNames(object).forEach((prop) => {
    // 如果属性是对象，并且没有被冻结，则递归冻结
    if (object[prop] !== null
      && (typeof object[prop] === 'object' || typeof object[prop] === 'function')
      && !Object.isFrozen(object[prop]))
      deepFreeze(object[prop])
  })

  return object
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

export const createPhecda = Factory
