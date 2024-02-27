import type { Construct } from 'phecda-core'
import type { ActiveInstance } from './types'

export async function waitUntilInit(...instances: InstanceType<Construct>[]) {
  await Promise.all(instances.map(i => i._promise))
}

let activeInstance: ActiveInstance

export function resetActiveInstance(instance?: ActiveInstance) {
  activeInstance = instance || {
    state: {},
    _v: new WeakMap(),
    _r: new WeakMap(),
    _f: new WeakMap(),
    _c: new WeakMap(),

  }
}

export function getActiveInstance(): ActiveInstance {
  return activeInstance
}

export function serializeState() {
  return JSON.parse(JSON.stringify(activeInstance.state))
}
