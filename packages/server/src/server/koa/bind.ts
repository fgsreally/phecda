import type Router from '@koa/router'
import type { RouterParamContext } from '@koa/router'
import type { DefaultContext, DefaultState } from 'koa'
import Debug from 'debug'
import type { HttpContext, HttpOptions } from '../types'
import { argToReq } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import { Context } from '../../context'

import { HMR } from '../../hmr'
import { createControllerMetaMap, detectAopDep } from '../../helper'

const debug = Debug('phecda-server/koa')
export interface KoaCtx extends HttpContext {
  type: 'koa'
  ctx: DefaultContext & RouterParamContext<DefaultState, DefaultContext>
  next: Function
  app: Router
}

export type Plugin = Router.Middleware

export function bind(router: Router, data: Awaited<ReturnType<typeof Factory>>, opts: HttpOptions = {}) {
  const { globalGuards, globalInterceptors, parallelRoute = '/__PHECDA_SERVER__', globalPlugins = [], parallelPlugins = [], globalFilter, globalPipe } = opts

  const { moduleMap, meta } = data
  const originStack = router.stack.slice(0, router.stack.length)

  const metaMap = createControllerMetaMap(meta, (meta) => {
    const { controller, http, func, tag } = meta.data
    if (controller === 'http' && http?.type) {
      debug(`register method "${func}" in module "${tag}"`)
      return true
    }
  })
  detectAopDep(meta, {
    plugins: [...globalPlugins, ...parallelPlugins],
    guards: globalGuards,
    interceptors: globalInterceptors,
  })
  registerRoute()
  async function registerRoute() {
    Context.usePlugin<Plugin>(globalPlugins, 'koa').forEach(p => router.use(p))

    if (parallelRoute) {
      router.post(parallelRoute, ...Context.usePlugin<Plugin>(parallelPlugins, 'koa'), async (ctx, next) => {
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
                getCookie: key => ctx.cookies.get(key),
                setCookie: (key, value, opts) => ctx.cookies.set(key, value, opts),
                delCookie: key => ctx.cookies.set(key, '', { expires: new Date(0) }),
                redirect: url => ctx.redirect(url),
                setResHeaders: headers => ctx.set(headers),
                setResStatus: status => ctx.status = status,
                getRequest: () => ctx.req,
                getResponse: () => ctx.res
              } as KoaCtx
              const context = new Context(contextData)
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
    }

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
        router[http.type](http.prefix + http.route, ...Context.usePlugin<Plugin>(plugins, 'koa'), async (ctx, next) => {
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
            getCookie: key => ctx.cookies.get(key),
            setCookie: (key, value, opts) => ctx.cookies.set(key, value, opts),
            delCookie: key => ctx.cookies.set(key, '', { expires: new Date(0) }),

            redirect: url => ctx.redirect(url),
            setResHeaders: headers => ctx.set(headers),
            setResStatus: status => ctx.status = status,
            getRequest: () => ctx.req,
            getResponse: () => ctx.res

          } as KoaCtx
          const context = new Context(contextData)
          if (http.headers)
            ctx.set(http.headers)

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

  HMR(async () => {
    router.stack = originStack
    registerRoute()
  })
}
