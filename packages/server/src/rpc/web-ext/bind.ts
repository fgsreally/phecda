import Debug from 'debug'
import type { Factory } from '../../core'
import { Context } from '../../context'
import type { RpcCtx, RpcServerOptions } from '../types'
import { createControllerMetaMap, detectAopDep } from '../../helper'
const debug = Debug('phecda-server/electron')

export interface WebExtCtx extends RpcCtx {
  type: 'browser-extension'
  sender: chrome.runtime.MessageSender
}

export function bind({ moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts: RpcServerOptions = {}) {
  const { globalGuards, globalFilter, globalPipe, globalAddons = [] } = opts
  const metaMap = createControllerMetaMap(meta, (meta) => {
    const { controller, rpc, func, tag } = meta.data
    if (controller === 'rpc' && rpc?.queue !== undefined) {
      debug(`register method "${func}" in module "${tag}"`)
      return true
    }
  })

  detectAopDep(meta, {
    guards: globalGuards,
    addons: globalAddons,
  }, 'rpc')

  chrome.runtime.onMessage.addListener(callback)

  async function callback(data: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    const { func, id, tag, _ps, args } = data || {}
    debug(`invoke method "${func}" in module "${tag}"`)

    if (_ps !== 1)
      return
    const meta = metaMap.get(tag)![func]

    const {
      data: { rpc: { isEvent } = {} },
    } = meta

    const aop = Context.getAop(meta, {
      globalFilter,
      globalGuards,
      globalPipe,
    })
    const context = new Context(<WebExtCtx>{
      type: 'browser-extension',
      category: 'rpc',
      moduleMap,
      meta,
      tag,
      func,
      args,
      id,
      isEvent,
      queue: tag,
      sender,
    })
    return await context.run(aop, (returnData) => {
      if (!isEvent)
        sendResponse({ data: returnData, id })
    }, (err) => {
      if (!isEvent) {
        sendResponse({
          data: err,
          error: true,
          id,
        })
      }
    })
  }
}
