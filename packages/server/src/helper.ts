// help you build custom framework or decorator

import pc from 'picocolors'
import { log } from './utils'
import { Context } from './context'
import { HMR } from './hmr'
import { ControllerMeta, Meta } from './meta'
import { IS_STRICT } from './common'

export * from './hmr'
export * from './http/helper'
export * from './rpc/helper'
export * from './decorators/helper'

export function createControllerMetaMap(meta: Meta[], filter: (meta: Meta) => boolean | void) {
  const metaMap = new Map<string, Record<string, ControllerMeta>>()

  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func } = item.data
      if (!filter(item))
        continue

      if (metaMap.has(tag))
        metaMap.get(tag)![func] = item as ControllerMeta

      else
        metaMap.set(tag, { [func]: item as ControllerMeta })
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
      if (IS_STRICT)
        process.exit(5)
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
  // 确保路径以斜杠开头，并且用斜杠连接每个部分
  const joinedPath = [base, ...paths].map(path => path.replace(/^\/+|\/+$/g, '')).join('/')
  return `/${joinedPath}` // 确保结果以斜杠开头
}
