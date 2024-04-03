import { getTag, invokeHandler } from 'phecda-core'
import type { Construct } from 'phecda-core'
import type { ActiveInstance } from './types'

export function waitUntilInit(...instances: InstanceType<Construct>[]) {
  return Promise.all(instances.map(i => i._promise))
}

let activeInstance: ActiveInstance

export function resetActiveInstance(instance?: ActiveInstance) {
  activeInstance = instance || {
    state: {},
    origin: new WeakMap(),
    cache: new WeakMap(),

  }
}

export function getActiveInstance(): ActiveInstance {
  return activeInstance
}

export function serializeState() {
  return JSON.parse(JSON.stringify(activeInstance.state))
}

export function isModuleLoad(model: Construct) {
  const { origin, state } = getActiveInstance()
  const tag = getTag(model)
  if (tag in state) {
    if (origin.get(state[tag]) !== model)
      throw new Error(`Synonym module: Module taged "${String(tag)}" (but not "${model.name}") has been loaded before`)

    return true
  }
  return false
}

export async function unmountModule(model: Construct | PropertyKey) {
  if (typeof model === 'object')
    model = getTag(model)

  const { state } = getActiveInstance()
  await invokeHandler('unmount', state[model as PropertyKey])
  delete state[model as PropertyKey]
}
