// help you build custom framework or decorator

import pc from 'picocolors'
import { log } from './utils'
import { Context } from './context'
import { HMR } from './hmr'
import { ControllerMeta, Meta } from './meta'
import { IS_PURE, IS_STRICT } from './common'

export * from './hmr'
export * from './http/helper'
export * from './decorators/helper'

export function createControllerMetaMap(meta: Meta[], filter: (meta: Meta) => boolean | void) {
  const metaMap = new Map<string, Record<string, ControllerMeta>>()

  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, method } = item.data
      if (!filter(item))
        continue

      if (metaMap.has(tag))
        metaMap.get(tag)![method] = item as ControllerMeta

      else
        metaMap.set(tag, { [method]: item as ControllerMeta })
    }
  }

  handleMeta()
  HMR(handleMeta)

  return metaMap
}

// detect whether addon/filter/pipe/guard/intercept is injected
export function detectAopDep(meta: Meta[], { guards, addons }: {
  guards?: string[]
  addons?: string[]

} = {}, controller = 'http') {
  if (IS_PURE)
    return

  const addonSet = new Set<string>()
  const guardSet = new Set<string>()
  const pipeSet = new Set<string>()
  const filterSet = new Set<string>()
  const warningSet = new Set<string>()
  function handleMeta() {
    addonSet.clear()
    guardSet.clear()
    pipeSet.clear()
    filterSet.clear()
    warningSet.clear()

    addons?.forEach((item) => {
      addonSet.add(item)
    })
    guards?.forEach((item) => {
      guardSet.add(item)
    });

    (meta as ControllerMeta[]).forEach(({ data }) => {
      if (!data.controller)
        return

      if (typeof data.tag !== 'string')
        warningSet.add(`Tag of controller "${data.name}" should be a string`)

      // @todo method of meta on controller should be string

      if (data.controller !== controller) {
        if (data[controller])
          warningSet.add(`Should use ${controller} controller to decorate class "${data.name}"`)

        return
      }
      if (data.filter)
        filterSet.add(data.filter)

      data.guards.forEach(i => guardSet.add(i))
      data.addons.forEach(i => addonSet.add(i))
      data.params.forEach((i) => {
        if (i.pipe)
          pipeSet.add(i.pipe)
      })
    })
    const missAddons = [...addonSet].filter(i => !Context.addonRecord[i])
    const missGuards = [...guardSet].filter(i => !Context.guardRecord[i])
    const missPipes = [...pipeSet].filter(i => !Context.pipeRecord[i])
    const missFilters = [...filterSet].filter(i => !Context.filterRecord[i])

    function exit() {
      if (IS_STRICT) {
        log('Does not meet strict mode requirements', 'error')
        process.exit(1)
      }
    }

    if (missAddons.length) {
      log(`${pc.white(`Addon [${missAddons.join(',')}]`)} doesn't exist`, 'warn')
      exit()
    }
    if (missGuards.length) {
      log(`${pc.magenta(`Guard [${missGuards.join(',')}]`)} doesn't exist`, 'warn')
      exit()
    }
    if (missPipes.length) {
      log(`${pc.blue(`Pipe [${missPipes.join(',')}]`)} doesn't exist`, 'warn')
      exit()
    }
    if (missFilters.length) {
      log(`${pc.red(`Filter [${missFilters.join(',')}]`)} doesn't exist`, 'warn')
      exit()
    }

    warningSet.forEach(warn => log(warn, 'warn'))
    if (warningSet.size)
      exit()
  }

  handleMeta()
  HMR(handleMeta)
  return {
    addonSet,
    guardSet,
    pipeSet,
    filterSet,
  }
}

export function joinUrl(base: string, ...paths: string[]) {
  const joinedPath = [base, ...paths].filter(p => p).map(path => path.replace(/(^\/)/g, '')).join('/')
  return `/${joinedPath}`
}
