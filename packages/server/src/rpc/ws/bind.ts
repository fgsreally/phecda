import type WS from 'ws'
import Debug from 'debug'

import { createControllerMetaMap, detectAopDep } from '../../helper'
import { Factory } from '../../core'
import { Context } from '../../context'
import { RpcCtx, RpcServerOptions } from '../types'
const debug = Debug('phecda-server/ws')

export interface WsCtx extends RpcCtx {
  type: 'ws'
  ws: WS
  wss: WS.Server
}

export function bind(wss: WS.Server, data: Awaited<ReturnType<typeof Factory>>, opts: RpcServerOptions = {}) {
  const { globalGuards, globalAddons, globalFilter, globalPipe } = opts
  const { moduleMap, meta } = data

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

  wss.on('connection', (ws) => {
    ws.on('message', async (raw) => {
      try {
        const data = JSON.parse(raw.toString())
        const { func, id, tag, _ps, args, queue } = data

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

        const context = new Context<WsCtx>({
          type: 'ws' as const,
          category: 'rpc' as const,
          meta,
          moduleMap,
          tag,
          func,
          args,
          id,
          queue,
          wss,
          ws,
        })

        return await context.run(aop, (returnData) => {
          if (!isEvent)
            ws.send(JSON.stringify({ id, data: returnData }))
        }, (err) => {
          if (!isEvent)

            ws.send(JSON.stringify({ id, data: err, error: true }))
        })
      }
      catch (e) {
        // not a phecda-client request
      }
    })
  })
}
