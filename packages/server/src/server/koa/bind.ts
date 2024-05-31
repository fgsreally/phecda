import type Router from '@koa/router'
import type { RouterParamContext } from '@koa/router'
import type { DefaultContext, DefaultState } from 'koa'
import Debug from 'debug'
import type { HttpContext, HttpOptions } from '../helper'
import { argToReq } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { ControllerMeta } from '../../meta'
import { Context, detectAopDep } from '../../context'

import { HMR } from '../../hmr'

const debug = Debug('phecda-server/koa')
export interface KoaCtx extends HttpContext {
  type: 'koa'
  ctx: DefaultContext & RouterParamContext<DefaultState, DefaultContext>
  next: Function
  app: Router
}

export function bind(router: Router, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, opts: HttpOptions = {}) {
  const { globalGuards, globalInterceptors, route, plugins, globalFilter, globalPipe } = { route: '/__PHECDA_SERVER__', plugins: [], ...opts }

  const originStack = router.stack.slice(0, router.stack.length)

  const metaMap = new Map<string, Record<string, ControllerMeta>>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func, controller, http } = item.data
      if (controller !== 'http' || !http?.type)
        continue

      debug(`register method "${func}" in module "${tag}"`)

      if (metaMap.has(tag))
        metaMap.get(tag)![func] = item as ControllerMeta

      else
        metaMap.set(tag, { [func]: item as ControllerMeta })
    }
  }
  async function createRoute() {
    router.post(route, ...Context.usePlugin(plugins), async (ctx, next) => {
      const { body } = ctx.request as any

      async function errorHandler(e: any) {
        const error = await Context.filterRecord.default(e)
        ctx.status = error.status
        ctx.body = error
      }

      if (!Array.isArray(body))
        return errorHandler(new BadRequestException('data format should be an array'))

      try {
        return Promise.all(body.map((item: any, i) => {
          // eslint-disable-next-line no-async-promise-executor
          return new Promise(async (resolve) => {
            const { tag, func } = item
            debug(`(parallel)invoke method "${func}" in module "${tag}"`)

            if (!metaMap.has(tag))
              return resolve(await Context.filterRecord.default(new BadRequestException(`module "${tag}" doesn't exist`)))

            const meta = metaMap.get(tag)![func]
            if (!meta)
              return resolve(await Context.filterRecord.default(new BadRequestException(`"${func}" in "${tag}" doesn't exist`)))

            const {
              data: {
                params,

              },
            } = meta

            const contextData = {
              type: 'koa' as const,
              index: i,
              ctx,
              meta,
              moduleMap,
              parallel: true,
              next,
              app: router,
              ...argToReq(params, item.args, ctx.headers),
              tag,
              func,
            }
            const context = new Context<KoaCtx>(contextData)
            context.run({
              globalGuards, globalInterceptors, globalFilter, globalPipe,
            }, resolve, resolve)
          })
        })).then((ret) => {
          ctx.body = ret
        })
      }
      catch (e) {
        return errorHandler(e)
      }
    })

    for (const [tag, record] of metaMap) {
      for (const func in record) {
        const meta = metaMap.get(tag)![func]

        const {
          data: {
            plugins,
            http,
          },
        } = meta

        if (!http?.type)
          continue
        router[http.type](http.prefix + http.route, ...Context.usePlugin(plugins), async (ctx, next) => {
          debug(`invoke method "${func}" in module "${tag}"`)

          const contextData = {
            type: 'koa' as const,
            app: router,

            ctx,
            meta,
            moduleMap,
            tag,
            func,
            query: ctx.query,
            params: ctx.params,
            body: (ctx.request as any).body,
            headers: ctx.headers,
            next,
          }
          const context = new Context<KoaCtx>(contextData)
          if (http.headers) {
            for (const name in http.headers)
              ctx.set(name, http.headers[name])
          }
          await context.run({

            globalGuards, globalInterceptors, globalFilter, globalPipe,
          }, (
            returnData,
          ) => {
            if (ctx.res.writableEnded)
              return
            ctx.body = returnData
          }, (err) => {
            if (ctx.res.writableEnded)
              return
            ctx.status = err.status
            ctx.body = err
          })
        })
      }
    }
  }

  detectAopDep(meta, {
    plugins,
    guards: globalGuards,
    interceptors: globalInterceptors,
  })
  handleMeta()
  createRoute()

  HMR(async () => {
    router.stack = originStack

    detectAopDep(meta, {
      plugins,
      guards: globalGuards,
      interceptors: globalInterceptors,
    })
    handleMeta()
    createRoute()
  })
}
