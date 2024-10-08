import { IncomingMessage, ServerResponse } from 'node:http'
import Debug from 'debug'
import type { Hono, Context as HonoContext, MiddlewareHandler } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { HttpContext, HttpOptions } from '../types'
import { argToReq } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import { Context } from '../../context'

import { createControllerMetaMap, detectAopDep } from '../../helper'
const debug = Debug('phecda-server/hono')
export interface HonoCtx extends HttpContext {
  type: 'hono'
  context: HonoContext
  app: Hono

}

export type Plugin = MiddlewareHandler

export function bind(router: Hono, data: Awaited<ReturnType<typeof Factory>>, opts: HttpOptions = {}) {
  const { globalGuards, globalInterceptors, parallelRoute = '/__PHECDA_SERVER__', globalPlugins = [], parallelPlugins = [], globalFilter, globalPipe } = opts

  const { moduleMap, meta } = data

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
    Context.usePlugin<Plugin>(globalPlugins, 'hono').forEach(p => router.use(p))
    if (parallelRoute) {
      router.post(parallelRoute, ...Context.usePlugin<Plugin>(parallelPlugins, 'hono'), async (c) => {
        const body = await c.req.json()

        async function errorHandler(e: any) {
          const error = await Context.filterRecord.default(e)
          c.status(error.status)
          return c.json(error)
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
                type: 'hono' as const,
                parallel: true,
                context: c,
                index: i,
                meta,
                moduleMap,
                tag,
                func,
                app: router,
                ...argToReq(params, item.args, c.req.header()),
                getCookie: key => getCookie(c, key),
                delCookie: key => deleteCookie(c, key),
                setCookie: (key, value, opts) => setCookie(c, key, value, opts as any),
                redirect: url => c.redirect(url),
                setResHeaders: (headers) => {
                  for (const name in headers)
                    c.header(name, headers[name])
                },
                setResStatus: status => c.status(status as any),
                getRequest: () => c.req.raw as unknown as IncomingMessage,
                getResponse: () => c.res as unknown as ServerResponse,
              } as HonoCtx
              const context = new Context(contextData)

              context.run({
                globalGuards, globalInterceptors, globalFilter, globalPipe,
              }, resolve, resolve)
            })
          })).then((ret) => {
            return c.json(ret)
          }) as any
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

            params,
            plugins,
            http,
          },
        } = meta

        if (!http?.type)
          continue
        const needBody = params.some(item => item.type === 'body')

        router[http.type](http.prefix + http.route, ...Context.usePlugin<Plugin>(plugins, 'hono'), async (c) => {
          debug(`invoke method "${func}" in module "${tag}"`)

          const contextData = {
            type: 'hono' as const,
            context: c,
            meta,
            moduleMap,
            tag,
            func,
            query: c.req.query(),
            body: needBody ? await c.req.json() : undefined,
            params: c.req.param() as any,
            headers: c.req.header(),
            app: router,
            getCookie: key => getCookie(c, key),
            delCookie: key => deleteCookie(c, key),
            setCookie: (key, value, opts) => setCookie(c, key, value, opts as any),
            redirect: url => c.redirect(url),
            setResHeaders: (headers) => {
              for (const name in headers)
                c.header(name, headers[name])
            },
            setResStatus: status => c.status(status as any),
            getRequest: () => c.req.raw as unknown as IncomingMessage,
            getResponse: () => c.res as unknown as ServerResponse,
          } as HonoCtx

          const context = new Context(contextData)
          if (http.headers) {
            for (const name in http.headers)
              c.header(name, http.headers[name])
          }
          return context.run({
            globalGuards, globalInterceptors, globalFilter, globalPipe,
          }, (returnData) => {
            if (returnData instanceof Response)
              return returnData

            if (typeof returnData === 'string')
              return c.text(returnData)

            else
              return c.json(returnData)
          }, (err) => {
            c.status(err.status)
            return c.json(err)
          })
        })
      }
    }
  }
}
