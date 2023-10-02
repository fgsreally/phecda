import { registerAsync } from 'phecda-core'
import 'reflect-metadata'

type Construct<T = any> = new (...args: any[]) => T

export const moduleMap = new Map<string, InstanceType<Construct>>()

export async function Factory(Modules: (new (...args: any) => any)[]) {
  for (const Module of Modules)
    await buildNestModule(Module)
}

if (__DEV__) {
  // @ts-expect-error work for hmr
  window.__PHECDA_MODULE_UPDATE__ = (target) => {
    target = Object.values(target)[0]
    const tag = target.prototype?.__TAG__ || target.name
    const module = moduleMap.get(tag)
    module.destroy?.()
    moduleMap.delete(tag)
    buildNestModule(target)
  }
}

async function buildNestModule(Module: Construct) {
  const paramtypes = getParamtypes(Module) as Construct[]

  let instance: InstanceType<Construct>
  const tag = Module.prototype?.__TAG__ || Module.name

  if (moduleMap.has(tag)) {
    instance = moduleMap.get(tag)
    if (!instance)
      throw new Error(`exist Circular-Dependency or Multiple modules with the same name/tag [tag] ${tag}--[module] ${Module}`)

    return instance
  }
  moduleMap.set(tag, undefined)
  if (paramtypes) {
    const paramtypesInstances = [] as any[]
    for (const i in paramtypes)
      paramtypesInstances[i] = await buildNestModule(paramtypes[i])

    instance = new Module(...paramtypesInstances)
  }
  else {
    instance = new Module()
  }
  await registerAsync(instance)
  moduleMap.set(tag, instance)
  if (__DEV__) {
    const proxy = new Proxy({}, {
      get(_target, p) {
        return moduleMap.get(tag)[p]
      },
      set(_target, p, value) {
        moduleMap.get(tag)[p] = value
        return true
      },
    })

    return proxy
  }
  return instance
}

function getParamtypes(Module: any, key?: string | symbol) {
  return Reflect.getMetadata('design:paramtypes', Module, key!)
}
