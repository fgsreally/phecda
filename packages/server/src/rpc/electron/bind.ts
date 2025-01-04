import Debug from 'debug'
import type Electron from 'electron'
import type { Factory } from '../../core'
import { Context } from '../../context'
import type { RpcCtx, RpcServerOptions } from '../types'
import { createControllerMetaMap, detectAopDep } from '../../helper'
const debug = Debug('phecda-server/electron')

export interface ElectronCtx extends RpcCtx {
  type: 'electron'
  event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent
}

export function bind(IPC: Electron.IpcMain, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts: RpcServerOptions = {}) {
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

  IPC.handle('phecda-server:invoke', callback)

  IPC.on('phecda-server:send', callback)

  async function callback(event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent, data: any) {
    const { func, id, tag, _ps, args } = data
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
    const context = new Context(<ElectronCtx>{
      type: 'electron',
      category: 'rpc',
      moduleMap,
      meta,
      tag,
      func,
      args,
      id,
      isEvent,
      queue: tag,
      event,
    })
    return await context.run(aop, (returnData) => {
      if (!isEvent)
        return { data: returnData, id }
    }, (err) => {
      if (!isEvent) {
        return {
          data: err,
          error: true,
          id,
        }
      }
    })
  }
}
