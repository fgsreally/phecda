import { invokeHandler } from 'phecda-core'
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

export async function unmountModule(module: Construct | PropertyKey) {
  if (typeof module === 'object')
    module = getTag(module)

  const { state } = getActiveInstance()
  await invokeHandler('unmount', state[module as PropertyKey])
  delete state[module as PropertyKey]
}
