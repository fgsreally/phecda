import type { IncomingHttpHeaders } from 'node:http'
import { createRouter, defineEventHandler, deleteCookie, eventHandler, getCookie, getQuery, getRequestHeaders, getRouterParams, readBody, sendRedirect, setCookie, setHeaders, setResponseHeaders, setResponseStatus, useBase } from 'h3'
import type { H3Event, Router, _RequestMiddleware } from 'h3'
import Debug from 'debug'

import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import { AOP, Context } from '../../context'
import type { HttpCtx, HttpOptions } from '../types'
import { createControllerMetaMap, detectAopDep, joinUrl } from '../../helper'

const debug = Debug('phecda-server/h3')

export interface H3Ctx extends HttpCtx {
  type: 'h3'
  event: H3Event
  app: Router

}

export type Addon = _RequestMiddleware

export function bind(router: Router, data: Awaited<ReturnType<typeof Factory>>, opts: HttpOptions = {}) {
  const { globalGuards, parallelRoute, globalAddons = [], parallelAddons = [], globalFilter, globalPipe, dynamic = false } = opts

  const { moduleMap, meta } = data

  const metaMap = createControllerMetaMap(meta, (meta) => {
    const { controller, http, method, tag } = meta.data
    if (controller === 'http' && http?.method) {
      debug(`register method "${method}" in module "${tag}"`)
      return true
    }
  })
  detectAopDep(meta, {
    addons: [...globalAddons, ...parallelAddons],
    guards: globalGuards,
  })

  registerRoute()

  function registerRoute() {
    Context.applyAddons(globalAddons, router, 'h3')

    if (parallelRoute) {
      const subRouter = createRouter()
      Context.applyAddons(parallelAddons, subRouter, 'h3')

      subRouter.post(parallelRoute, eventHandler({
        handler: async (event) => {
          const body = await readBody(event, { strict: true })
          async function errorHandler(e: any) {
            const error = await Context.filterRecord.default(e)
            setResponseStatus(event, error.status)
            return error
          }

          if (!Array.isArray(body))
            return errorHandler(new BadRequestException('data format should be an array'))

          try {
            return Promise.all(body.map((item: any, i) => {
              // eslint-disable-next-line no-async-promise-executor
              return new Promise(async (resolve) => {
                if (!item)
                  return resolve(null)
                const { tag, method } = item

                debug(`(parallel)invoke method "${method}" in module "${tag}"`)

                if (!metaMap.has(tag))
                  return resolve(await Context.filterRecord.default(new BadRequestException(`module "${tag}" doesn't exist`)))

                const meta = metaMap.get(tag)![method]
                if (!meta)
                  return resolve(await Context.filterRecord.default(new BadRequestException(`"${method}" in "${tag}" doesn't exist`)))

                const aop = Context.getAop(meta, {
                  globalFilter,
                  globalGuards,
                  globalPipe,
                })
                const contextData = {
                  type: 'h3' as const,
                  category: 'http',
                  index: i,
                  event,
                  meta,
                  moduleMap,

                  parallel: true,
                  app: router,
                  ...item,
                  getCookie: key => getCookie(event, key),
                  setCookie: (key, value, opts) => setCookie(event, key, value, opts),
                  delCookie: key => deleteCookie(event, key),
                  redirect: (url, status) => sendRedirect(event, url, status),
                  setResHeaders: headers => setResponseHeaders(event, headers),
                  setResStatus: code => setResponseStatus(event, code),
                  getRequest: () => event.node.req,
                  getResponse: () => event.node.res,

                } as H3Ctx

                const context = new Context(contextData)

                context.run(aop, resolve, resolve)
              })
            }))
          }

          catch (e) {
            return errorHandler(e)
          }
        },
      }))
      router.use(parallelRoute, useBase('', subRouter.handler))
    }

    for (const [tag, record] of metaMap) {
      for (const method in record) {
        const meta = metaMap.get(tag)![method]
        const {
          data: {
            http,
            params,
            addons,

          },
        } = meta

        if (!http?.method)
          continue
        const needBody = params.some(item => item.type === 'body')

        let aop: AOP
        if (!dynamic) {
          aop = Context.getAop(meta, {
            globalFilter,
            globalGuards,
            globalPipe,
          })
        }

        const subRouter = createRouter()

        Context.applyAddons(addons, subRouter, 'h3')
        subRouter[http.method](joinUrl(http.prefix, http.route), defineEventHandler(async (event) => {
          debug(`invoke method "${method}" in module "${tag}"`)

          const contextData = {
            type: 'h3' as const,
            category: 'http',
            meta,
            event,
            moduleMap,
            tag,
            method,
            headers: getRequestHeaders(event) as IncomingHttpHeaders,
            params: getRouterParams(event),
            query: getQuery(event),
            app: router,
            body: needBody ? await readBody(event, { strict: true }) : undefined,
            getCookie: key => getCookie(event, key),
            setCookie: (key, value, opts) => setCookie(event, key, value, opts),
            redirect: url => sendRedirect(event, url),
            setResHeaders: headers => setResponseHeaders(event, headers),
            setResStatus: code => setResponseStatus(event, code),
            delCookie: key => deleteCookie(event, key),
            getRequest: () => event.node.req,
            getResponse: () => event.node.res,

          } as H3Ctx
          const context = new Context(contextData)
          setHeaders(event, http.headers || {})

          if (dynamic) {
            aop = Context.getAop(meta, {
              globalFilter,
              globalGuards,
              globalPipe,
            })
          }
          return context.run(aop, returnData => returnData, (err) => {
            setResponseStatus(event, err.status)
            return err
          })
        }))

        router.use(joinUrl(http.prefix, http.route), useBase('', subRouter.handler))
      }
    }
  }
}
