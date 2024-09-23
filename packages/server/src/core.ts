import 'reflect-metadata'
import EventEmitter from 'node:events'
import type { Construct, Phecda, WatcherParam } from 'phecda-core'
import { getInject, getMergedMeta, getMetaKey, getMetaParams, getTag, invokeInit, invokeUnmount, isPhecda, setInject } from 'phecda-core'
import Debug from 'debug'
import type { Emitter } from './types'
import type { MetaData } from './meta'
import { Meta } from './meta'
import { log } from './utils'
import { IS_HMR, IS_ONLY_GENERATE } from './common'
import type { Generator } from './generator'

const debug = Debug('phecda-server(createPhecda)')
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

    const generateCode = async () => {
      if (IS_HMR) {
        return Promise.all(this.generators.map((generator) => {
          debug(`generate "${generator.name}" code to ${generator.path}`)

          return generator.output(this.meta)
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
              await this.add(models[i])
          }
        }
        generateCode()
      })
    }

  }
  async add(Model: Construct) {
    const tag = getTag(Model)

    const oldInstance = await this.del(tag)
    const { module: newModule } = await this.buildDepModule(Model)

    if (oldInstance && this.dependenceGraph.has(tag)) {
      debug(`replace module "${String(tag)}"`);

      [...this.dependenceGraph.get(tag)!].forEach((tag) => {
        const module = this.moduleMap.get(tag)
        for (const key in module) {
          if (module[key] === oldInstance)
            module[key] = newModule
        }
      })
    }
  }
  async del(tag: PropertyKey) {
    if (!this.moduleMap.has(tag))
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
  }
  async destroy() {
    debug('destroy all')

    for (const [tag] of this.moduleMap)
      await this.del(tag)
  }
  protected async buildDepModule(Model: Construct) {
    const paramtypes = getParamTypes(Model) as Construct[]
    let module: InstanceType<Construct>
    const tag = getTag(Model)

    if (this.moduleMap.has(tag)) {
      module = this.moduleMap.get(tag)
      if (!module)
        throw new Error(`exist Circular-Dependency or Multiple modules with the same name/tag [tag] ${String(tag)}--[module] ${Model}`)

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
    this.meta.push(...getMetaFromInstance(module, tag, Model.name).map(this.parseMeta).filter(item => !!item))

    debug(`init module "${String(tag)}"`)

    if (!IS_ONLY_GENERATE)
      await invokeInit(module)

    debug(`add module "${String(tag)}"`)

    this.moduleMap.set(tag, module)
    this.modelMap.set(module, Model)
    return { module, tag }
  }

  has(modelOrTag: Construct | PropertyKey) {

    return this.moduleMap.has(typeof modelOrTag === 'function' ? getTag(modelOrTag) : modelOrTag)
  }
  get<Model extends Construct>(modelOrTag: Model | PropertyKey): InstanceType<Model> {
    const tag =typeof modelOrTag === 'function' ? getTag(modelOrTag) : modelOrTag
    if (!this.has(tag)) throw new Error(`module "${tag.toString()}" doesn't exist`)
    return this.moduleMap.get(tag)
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
  } else {
    if (typeof nsOrModel === 'string') {
      namespace = nsOrModel
    } else if (!namespace) {
      namespace = 'default'

    }
  }
  if (!phecdaNamespace.has(namespace)) throw new Error(`namespace "${namespace}" doesn't exist`)
  const serverPhecda = phecdaNamespace.get(namespace)!
  if (nsOrModel && typeof nsOrModel !== 'string') {
    return serverPhecda.get(nsOrModel)
  } else {

    return serverPhecda
  }

}

// export async function createPhecda(models: Construct[], opts: Options = {}) {
//   const moduleMap = new Map<PropertyKey, InstanceType<Construct>>()
//   const meta: Meta[] = []
//   const modelMap = new WeakMap<InstanceType<Construct>, Construct>()
//   const modelSet = new WeakSet<Construct>()
//   const dependenceGraph = new Map<PropertyKey, Set<PropertyKey>>()
//   const { parseModule = (module: any) => module, parseMeta = (meta: any) => meta, generators } = opts
//   if (!getInject('watcher')) {
//     setInject('watcher', ({ eventName, instance, property, options }: WatcherParam) => {
//       const fn = typeof instance[property] === 'function' ? instance[property].bind(instance) : (v: any) => instance[property] = v

//       if (options?.once)
//         (emitter as any).once(eventName, fn)

//       else
//         (emitter as any).on(eventName, fn)

//       return () => {
//         (emitter as any).off(eventName, fn)
//       }
//     })
//   }

//   // only remove module in moduleMap(won't remove indirect module)
//   async function del(tag: PropertyKey) {
//     if (!moduleMap.has(tag))
//       return

//     const module = moduleMap.get(tag)

//     debug(`unmount module "${String(tag)}"`)
//     await invokeUnmount(module)
//     debug(`del module "${String(tag)}"`)

//     moduleMap.delete(tag)
//     modelMap.delete(module)
//     for (let i = meta.length - 1; i >= 0; i--) {
//       if (meta[i].data.tag === tag)
//         meta.splice(i, 1)
//     }
//     return module
//   }

//   async function destroy() {
//     debug('destroy all')

//     for (const [tag] of moduleMap)
//       await del(tag)
//   }

//   async function add(Model: Construct) {
//     const tag = getTag(Model)

//     const oldInstance = await del(tag)
//     const { module: newModule } = await buildDepModule(Model)

//     if (oldInstance && dependenceGraph.has(tag)) {
//       debug(`replace module "${String(tag)}"`);

//       [...dependenceGraph.get(tag)!].forEach((tag) => {
//         const module = moduleMap.get(tag)
//         for (const key in module) {
//           if (module[key] === oldInstance)
//             module[key] = newModule
//         }
//       })
//     }
//   }

//   async function buildDepModule(Model: Construct) {
//     const paramtypes = getParamTypes(Model) as Construct[]
//     let module: InstanceType<Construct>
//     const tag = getTag(Model)

//     if (moduleMap.has(tag)) {
//       module = moduleMap.get(tag)
//       if (!module)
//         throw new Error(`exist Circular-Dependency or Multiple modules with the same name/tag [tag] ${String(tag)}--[module] ${Model}`)

//       if (modelMap.get(module) !== Model && !modelSet.has(Model)) {
//         modelSet.add(Model)// a module will only warn once

//         if (module instanceof Model)
//           log(`Module taged ${String(tag)} has been overridden`)// legal override
//         else
//           log(`Synonym module: Module taged "${String(tag)}" has been loaded before, so phecda-server won't load Module "${Model.name}"`, 'warn')
//       }
//       return { module, tag }
//     }
//     moduleMap.set(tag, undefined)
//     debug(`instantiate module "${String(tag)}"`)

//     if (paramtypes) {
//       const paramtypesInstances = [] as any[]
//       for (const i in paramtypes) {
//         const { module: sub, tag: subTag } = await buildDepModule(paramtypes[i])
//         paramtypesInstances[i] = sub
//         if (!dependenceGraph.has(subTag))
//           dependenceGraph.set(subTag, new Set())
//         dependenceGraph.get(subTag)!.add(tag)
//       }

//       module = parseModule(new Model(...paramtypesInstances))
//     }
//     else {
//       module = parseModule(new Model())
//     }
//     meta.push(...getMetaFromInstance(module, tag, Model.name).map(parseMeta).filter(item => !!item))

//     debug(`init module "${String(tag)}"`)

//     if (!IS_ONLY_GENERATE)
//       await invokeInit(module)

//     debug(`add module "${String(tag)}"`)

//     moduleMap.set(tag, module)
//     modelMap.set(module, Model)
//     return { module, tag }
//   }

//   for (const model of models)
//     await buildDepModule(model)

//   async function generateCode() {
//     if (generators && IS_HMR) {
//       return Promise.all(generators.map((generator) => {
//         debug(`generate "${generator.name}" code to ${generator.path}`)

//         return generator.output(meta)
//       }))
//     }
//   }

//   generateCode().then(() => {
//     if (IS_ONLY_GENERATE)
//       process.exit(4)// only output code/work for ci
//   })

//   if (IS_HMR) { // for hmr
//     if (!globalThis.__PS_HMR__)
//       globalThis.__PS_HMR__ = []

//     globalThis.__PS_HMR__?.push(async (files: string[]) => {
//       debug('reload files ')

//       for (const file of files) {
//         const models = await import(file)
//         for (const i in models) {
//           if (isPhecda(models[i]))
//             await add(models[i])
//         }
//       }
//       generateCode()
//     })
//   }

//   return {
//     moduleMap,
//     modelMap,
//     meta,
//     add,
//     del,
//     destroy,
//   }
// }



function getMetaFromInstance(instance: Phecda, tag: PropertyKey, name: string) {
  const propertyKeys = getMetaKey(instance).filter(item => typeof item === 'string') as string[]
  const baseMeta = getMergedMeta(instance, undefined) as MetaData

  const ctxs = baseMeta.ctxs
  return propertyKeys.filter(i => typeof (instance as any)[i] === 'function').map((i) => {
    const meta = getMergedMeta(instance, i)
    const metaData = {
      ...meta,
      name,
      tag,
      func:
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
      params.forEach((item, index) => {
        if (!item.pipe)
          item.pipe = meta.pipe || baseMeta.pipe
        if (!item.define)
          item.define = {}
        item.index = index
      })

      metaData.ctxs = ctxs
      metaData.params = params
      metaData.filter = meta.filter || baseMeta.filter
      metaData.define = { ...baseMeta.define, ...meta.define }

      for (const item of ['plugins', 'guards', 'interceptors']) {
        const set = new Set<string>(baseMeta[item])
        if (meta[item]) {
          meta[item].forEach((part: string) => {
            set.delete(part)
            set.add(part)
          })
        }

        metaData[item] = [...set]
      }

      // metaData.plugins = [...new Set([...baseMeta.plugins, ...meta.plugins])]
      // metaData.guards = [...new Set([...baseMeta.guards, ...meta.guards])]
      // metaData.interceptors = [...new Set([...baseMeta.interceptors, ...meta.interceptors])]
    }
    return new Meta(deepFreeze(metaData as MetaData), getParamTypes(instance, i as string) || [])
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


