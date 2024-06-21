// help you build custom framework or decorator

import pc from 'picocolors'
import { log } from './utils'
import { Context } from './context'
import { HMR } from './hmr'
import { ControllerMeta, Meta } from './meta'

export * from './hmr'
export * from './server/helper'
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

// detect whether plugin/filter/pipe/guard/intercept is injected
export function detectAopDep(meta: Meta[], { guards, interceptors, plugins }: {
  guards?: string[]
  interceptors?: string[]
  plugins?: string[]

} = {}, controller: string = 'http') {
  const pluginSet = new Set<string>()
  const guardSet = new Set<string>()
  const interceptorSet = new Set<string>()
  const pipeSet = new Set<string>()
  const filterSet = new Set<string>()
  const warningSet = new Set<string>()

  function handleMeta() {
    pluginSet.clear()
    guardSet.clear()
    interceptorSet.clear()
    pipeSet.clear()
    filterSet.clear()
    warningSet.clear()

    plugins?.forEach((item) => {
      pluginSet.add(item)
    })
    guards?.forEach((item) => {
      guardSet.add(item)
    })
    interceptors?.forEach((item) => {
      interceptorSet.add(item)
    });

    (meta as ControllerMeta[]).forEach(({ data }) => {
      if (data.controller !== controller) {
        if (data[controller])
          warningSet.add(`Module "${data.tag === data.name ? data.name : `${data.name}(${data.tag})`}"  should use ${controller} controller to decorate class or remove ${controller} decorator on method "${data.func}"`)

        return
      }
      if (data.filter)
        filterSet.add(data.filter)

      data.interceptors.forEach(i => interceptorSet.add(i))
      data.guards.forEach(i => guardSet.add(i))
      data.plugins.forEach(i => pluginSet.add(i))
      data.params.forEach((i) => {
        if (i.pipe)
          pipeSet.add(i.pipe)
      })
    })
    const missPlugins = [...pluginSet].filter(i => !Context.pluginRecord[i])
    const missGuards = [...guardSet].filter(i => !Context.guardRecord[i])
    const missInterceptors = [...interceptorSet].filter(i => !Context.interceptorRecord[i])
    const missPipes = [...pipeSet].filter(i => !Context.pipeRecord[i])
    const missFilters = [...filterSet].filter(i => !Context.filterRecord[i])

    if (missPlugins.length)
      log(`${pc.white(`Plugin [${missPlugins.join(',')}]`)} doesn't exist`, 'warn')
    if (missGuards.length)
      log(`${pc.magenta(`Guard [${missGuards.join(',')}]`)} doesn't exist`, 'warn')

    if (missInterceptors.length)
      log(`${pc.cyan(`Interceptor [${missInterceptors.join(',')}]`)} doesn't exist`, 'warn')

    if (missPipes.length)
      log(`${pc.blue(`Pipe [${missPipes.join(',')}]`)} doesn't exist`, 'warn')

    if (missFilters.length)
      log(`${pc.red(`Filter [${missFilters.join(',')}]`)} doesn't exist`, 'warn')

    warningSet.forEach(warn => log(warn, 'warn'))
  }

  handleMeta()
  HMR(handleMeta)
  return {
    pluginSet,
    guardSet,
    interceptorSet,
    pipeSet,
    filterSet,
  }
}
