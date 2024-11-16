import Router from '@koa/router'
import type { RouterParamContext } from '@koa/router'
import type { DefaultContext, DefaultState } from 'koa'
import Debug from 'debug'
import type { HttpContext, HttpOptions } from '../types'
import { argToReq } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import { AOP, Context } from '../../context'

import { HMR } from '../../hmr'
import { createControllerMetaMap, detectAopDep,joinUrl } from '../../helper'

const debug = Debug('phecda-server/koa')
export interface KoaCtx extends HttpContext {
  type: 'koa'
  ctx: DefaultContext & RouterParamContext<DefaultState, DefaultContext>
  next: Function
  app: Router
}

export type Addon = Router.Middleware

export function bind(router: Router, data: Awaited<ReturnType<typeof Factory>>, opts: HttpOptions = {}) {
  const { globalGuards, parallelRoute = '/__PHECDA_SERVER__', globalAddons = [], parallelAddons = [], globalFilter, globalPipe, dynamic = false } = opts

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
    addons: [...globalAddons, ...parallelAddons],
    guards: globalGuards,
  })
  registerRoute()
  function registerRoute() {
    Context.applyAddons(globalAddons, router, 'koa')

    if (parallelRoute) {
      const subRouter = new Router()
      Context.applyAddons(parallelAddons, subRouter, 'koa')

      subRouter.post(parallelRoute, async (ctx, next) => {
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
              const aop = Context.getAop(meta, {
                globalGuards, globalFilter, globalPipe,
              })
              const contextData = {
                type: 'koa' as const,
                category: 'http',
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
                getResponse: () => ctx.res,

              } as KoaCtx
              const context = new Context(contextData)
              context.run(aop, resolve, resolve)
            })
          })).then((ret) => {
            ctx.body = ret
          })
        }
        catch (e) {
          return errorHandler(e)
        }
      })
      router.use(subRouter.routes()).use(subRouter.allowedMethods())
    }

    for (const [tag, record] of metaMap) {
      for (const func in record) {
        const meta = metaMap.get(tag)![func]

        const {
          data: {
            addons,
            http,
          },
        } = meta

        if (!http?.type)
          continue

        let aop: AOP
        if (!dynamic) {
          aop = Context.getAop(meta, {
            globalFilter,
            globalGuards,
            globalPipe,
          })
        }
        const subRouter = new Router()
        Context.applyAddons(addons, subRouter, 'koa')
        router[http.type](joinUrl(http.prefix , http.route), async (ctx, next) => {
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
            category: 'http',
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
            getResponse: () => ctx.res,
          } as KoaCtx
          const context = new Context(contextData)
          if (http.headers)
            ctx.set(http.headers)

          if (dynamic) {
            aop = Context.getAop(meta, {
              globalFilter,
              globalGuards,
              globalPipe,
            })
          }
          await context.run(aop, (
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

        router.use(subRouter.routes()).use(subRouter.allowedMethods())
      }
    }
  }

  HMR(async () => {
    router.stack = originStack
    registerRoute()
  })
}
