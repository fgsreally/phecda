import EventEmitter from 'node:events'
import type { Construct, Phecda, WatcherParam } from 'phecda-core'
import { getInject, getMergedMeta, getMetaKey, getMetaParams, getTag, invokeInit, invokeUnmount, setInject } from 'phecda-core'
import Debug from 'debug'
import type { Emitter } from './types'
import type { MetaData } from './meta'
import { Meta } from './meta'
import { log } from './utils'
import { IS_ONLY_GENERATE, PS_EXIT_CODE } from './common'
import type { Generator } from './generator'
import { HMR } from './hmr'

const debug = Debug('phecda-server(Factory)')
// TODO: support both emitter types and origin emitter type in future
export const emitter: Emitter = new EventEmitter() as any
export interface Options {
  parseModule?: (module: any) => any
  parseMeta?: (meta: Meta) => Meta | null | undefined
  generators?: Generator[]
  namespace?: string

}

export function defaultServerInject() {
  if (!getInject('watcher')) {
    setInject('watcher', ({ eventName, instance, property, options }: WatcherParam) => {
      const fn = typeof instance[property] === 'function' ? instance[property].bind(instance) : (v: any) => instance[property] = v

      if (options?.once)
        (emitter as any).once(eventName, fn)

      else
        (emitter as any).on(eventName, fn)

      return () => {
        (emitter as any).off(eventName, fn)
      }
    })
  }
}

export const phecdaNamespace = new Map<string, ServerPhecda>()

export class ServerPhecda {
  moduleMap = new Map<PropertyKey, InstanceType<Construct>>()
  meta: Meta[] = []
  modelMap = new WeakMap<InstanceType<Construct>, Construct>()
  modelSet = new WeakSet<Construct>()
  dependenceGraph = new Map<PropertyKey, Set<PropertyKey>>()
  parseModule: (module: any) => any
  parseMeta: (meta: Meta) => Meta | null | undefined
  generators: Generator[]
  constructor(options: Options) {
    defaultServerInject()
    const { namespace = 'default', parseModule = (module: any) => module, parseMeta = (meta: any) => meta, generators = [] } = options
    phecdaNamespace.set(namespace, this)
    this.parseMeta = parseMeta
    this.parseModule = parseModule
    this.generators = generators
  }

  async start(models: Construct[]) {
    for (const model of models)
      await this.buildDepModule(model)

    this.hmr()
    this.generateCode().then(() => {
      if (IS_ONLY_GENERATE) {
        log('Only generate code')
        process.exit(PS_EXIT_CODE.EXIT)// only output code/work for ci
      }
    })
  }

  generateCode = async () => {
    return Promise.all(this.generators.map((generator) => {
      debug(`generate "${generator.name}" code to ${generator.path}`)

      return generator.output(this.meta)
    }))
  }

  hmr() {
    HMR(async (oldModels, newModels) => {
      debug('reload models ')

      await this.replace(oldModels, newModels)

      this.generateCode()
    })
  }

  async destroy() {
    debug('destroy all')

    this.replace(Object.values(this.modelMap), [])
  }

  createProxyModule(tag: PropertyKey) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    return new Proxy({}, {
      get(_target, prop) {
        const module = that.moduleMap.get(tag)
        return Reflect.get(module, prop, module)
      },
      set(_target, prop, newValue) {
        const module = that.moduleMap.get(tag)

        return Reflect.set(module, prop, newValue, module)
      },
      has(_target, prop) {
        return Reflect.has(that.moduleMap.get(tag), prop)
      },
      ownKeys() {
        return Reflect.ownKeys(that.moduleMap.get(tag))
      },
      getPrototypeOf() {
        return Reflect.getPrototypeOf(that.moduleMap.get(tag))
      },
      getOwnPropertyDescriptor(_target, prop) {
        return Reflect.getOwnPropertyDescriptor(that.moduleMap.get(tag), prop)
      },
    })
  }

  protected async buildDepModule(Model: Construct) {
    const paramtypes = getParamTypes(Model) as Construct[]
    let module: InstanceType<Construct>
    const tag = getTag(Model)

    if (this.moduleMap.has(tag)) {
      module = this.moduleMap.get(tag)
      if (!module) {
        log(`Exist Circular-Dependency or Multiple modules with the same tag [${String(tag)}]`, 'warn')
        return { module: this.createProxyModule(tag), tag }
      }
      if (this.modelMap.get(module) !== Model && !this.modelSet.has(Model)) {
        this.modelSet.add(Model)// a module will only warn once

        if (module instanceof Model)
          log(`Module taged ${String(tag)} has been overridden`)// legal override
        else
          log(`Synonym module: Module taged "${String(tag)}" has been loaded before, so phecda-server won't load Module "${Model.name}"`, 'warn')
      }
      return { module, tag }
    }
    this.moduleMap.set(tag, undefined)
    debug(`instantiate module "${String(tag)}"`)

    if (paramtypes) {
      const paramtypesInstances = [] as any[]
      for (const i in paramtypes) {
        const { module: sub, tag: subTag } = await this.buildDepModule(paramtypes[i])
        paramtypesInstances[i] = sub
        if (!this.dependenceGraph.has(subTag))
          this.dependenceGraph.set(subTag, new Set())
        this.dependenceGraph.get(subTag)!.add(tag)
      }

      module = this.parseModule(new Model(...paramtypesInstances))
    }
    else {
      module = this.parseModule(new Model())
    }
    this.meta.push(...getMetaFromInstance(module, tag, Model).map(this.parseMeta).filter(item => !!item))

    debug(`init module "${String(tag)}"`)

    if (!IS_ONLY_GENERATE)// ??

      await invokeInit(module)

    debug(`add module "${String(tag)}"`)

    this.moduleMap.set(tag, module)
    this.modelMap.set(module, Model)
    return { module, tag }
  }

  async replace(oldModels: Construct[], newModels: Construct[]) {
    const oldModules = (await Promise.all(oldModels.map(async (model) => {
      const tag = getTag(model)
      if (!this.has(tag))
        return
      const module = this.moduleMap.get(tag)

      debug(`unmount module "${String(tag)}"`)
      await invokeUnmount(module)
      debug(`del module "${String(tag)}"`)

      this.moduleMap.delete(tag)
      this.modelMap.delete(module)
      for (let i = this.meta.length - 1; i >= 0; i--) {
        if (this.meta[i].data.tag === tag)
          this.meta.splice(i, 1)
      }
      return module
    }))).filter(item => item)

    for (const model of newModels) {
      debug(`mount module: ${model.name}`)
      await this.buildDepModule(model)
    }

    debug('replace old modules')

    for (const module of oldModules) {
      const tag = getTag(module)
      if (this.dependenceGraph.has(tag)) {
        [...this.dependenceGraph.get(tag)!].forEach((depTag) => {
          const depModule = this.moduleMap.get(depTag)

          if (depModule) {
            for (const key in depModule) {
              if (depModule[key] === module)
                depModule[key] = this.moduleMap.get(tag)
            }
          }
        })
      }
    }
  }

  has(modelOrTag: Construct | PropertyKey) {
    return this.moduleMap.has(typeof modelOrTag === 'function' ? getTag(modelOrTag) : modelOrTag)
  }

  get<Model extends Construct>(modelOrTag: Model | PropertyKey): InstanceType<Model> {
    const tag = typeof modelOrTag === 'function' ? getTag(modelOrTag) : modelOrTag
    if (!this.has(tag))
      throw new Error(`module "${tag.toString()}" doesn't exist`)
    return this.moduleMap.get(tag)
  }

  getModel(tag: PropertyKey) {
    return this.modelMap.get(this.get(tag))
  }
}

export async function Factory(models: Construct[], opts: Options = {}) {
  const phecda = new ServerPhecda(opts)
  await phecda.start(models)
  return phecda
}

export function useS<Model extends Construct>(model: Model, namespace?: string): InstanceType<Model>
export function useS(namespace?: string): ServerPhecda
export function useS(nsOrModel?: Construct | string, namespace?: string) {
  if (!nsOrModel) {
    namespace = 'default'
  }
  else {
    if (typeof nsOrModel === 'string')
      namespace = nsOrModel
    else if (!namespace)
      namespace = 'default'
  }
  if (!phecdaNamespace.has(namespace))
    throw new Error(`namespace "${namespace}" doesn't exist`)
  const serverPhecda = phecdaNamespace.get(namespace)!
  if (nsOrModel && typeof nsOrModel !== 'string')
    return serverPhecda.get(nsOrModel)
  else

    return serverPhecda
}

function getMetaFromInstance(instance: Phecda, tag: PropertyKey, model: Construct) {
  const name = model.name
  const propertyKeys = getMetaKey(instance).filter(item => typeof item === 'string') as string[]
  const baseMeta = getMergedMeta(instance, undefined) as MetaData

  const ctxs = baseMeta.ctxs
  return propertyKeys.filter(i => typeof (instance as any)[i] === 'function').map((i) => {
    const meta = getMergedMeta(instance, i)
    const metaData = {
      ...meta,
      name,
      tag,
      method:
        i,
    } as MetaData
    if (baseMeta.controller) {
      if (typeof tag !== 'string')
        log(`can't use Tag with ${typeof tag} on controller "${(instance as any).constructor.name}",instead with "${tag = String(tag)}"`, 'error')
      metaData.controller = baseMeta.controller
      metaData[baseMeta.controller] = {
        ...baseMeta[baseMeta.controller],
        ...meta[baseMeta.controller],
      }

      const params = getMetaParams(instance, i).map(item => getMergedMeta(instance, i, item))

      metaData.meta = meta

      metaData.ctxs = ctxs
      metaData.params = params.map((item, index) => {
        return {
          ...item,
          pipe: item.pipe || meta.pipe || baseMeta.pipe,
          define: item.define || {},
          index,
          meta: item,
        }
      })
      metaData.filter = meta.filter || baseMeta.filter
      metaData.define = { ...baseMeta.define, ...meta.define }

      for (const item of ['addons', 'guards']) {
        const set = new Set<string>(baseMeta[item])
        if (meta[item]) {
          meta[item].forEach((part: string) => {
            set.delete(part)
            set.add(part)
          })
        }

        metaData[item] = [...set]
      }

      // metaData.addons = [...new Set([...baseMeta.addons, ...meta.addons])]
      // metaData.guards = [...new Set([...baseMeta.guards, ...meta.guards])]
      // metaData.interceptors = [...new Set([...baseMeta.interceptors, ...meta.interceptors])]
    }
    return new Meta(deepFreeze(metaData as MetaData), getParamTypes(instance, i as string) || [], instance, model)
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
