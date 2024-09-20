import type { Express, Request, RequestHandler, Response, Router } from 'express'
import Debug from 'debug'
import type { HttpContext, HttpOptions } from '../types'
import { argToReq } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import { Context } from '../../context'
import { createControllerMetaMap, detectAopDep } from '../../helper'
import { HMR } from '../../hmr'
import { IncomingMessage, ServerResponse } from 'node:http'

const debug = Debug('phecda-server/express')
export interface ExpressCtx extends HttpContext {
  type: 'express'
  request: Request
  response: Response
  next: Function
  app: Router

}

export type Plugin = RequestHandler

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

  HMR(async () => {
    router.stack = originStack// router.stack.slice(0, 1)
    registerRoute()
  })

  async function registerRoute() {
    Context.usePlugin<Plugin>(globalPlugins, 'express').forEach(p => router.use(p))

    if (parallelRoute) {
      (router as Express).post(parallelRoute, ...Context.usePlugin<Plugin>(parallelPlugins, 'express'), async (req, res, next) => {
        const { body } = req

        async function errorHandler(e: any) {
          const error = await Context.filterRecord.default(e)
          return res.status(error.status).json(error)
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
                type: 'express' as const,
                parallel: true,
                request: req,
                index: i,
                meta,
                response: res,
                moduleMap,
                tag,
                func,
                next,
                app: router,
                ...argToReq(params, item.args, req.headers),
                getCookie: key => req.cookies[key],
                setCookie: (key, value, opts) => res.cookie(key, value, opts || {}),
                delCookie: key => res.cookie(key, '', { expires: new Date(0) }),
                redirect: (url, status) => status ? res.redirect(status, url) : res.redirect(url),
                setResHeaders: headers => res.set(headers),
                setResStatus: code => res.status(code),
                getRequest: () => req as unknown as IncomingMessage,
                getResponse: () => res as unknown as ServerResponse,
              } as ExpressCtx
              const context = new Context(contextData)

              context.run({
                globalGuards, globalInterceptors, globalFilter, globalPipe,
              }, resolve, resolve)
            })
          })).then((ret) => {
            res.json(ret)
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

        (router as Express)[http.type](http.prefix + http.route, ...Context.usePlugin<Plugin>(plugins, 'express'), async (req, res, next) => {
          debug(`invoke method "${func}" in module "${tag}"`)

          const contextData = {
            type: 'express' as const,
            request: req,
            meta,
            response: res,
            moduleMap,
            tag,
            func,
            query: req.query,
            body: req.body,
            params: req.params,
            headers: req.headers,
            app: router,
            next,
            getCookie: key => req.cookies[key],
            setCookie: (key, value, opts) => res.cookie(key, value, opts || {}),

            delCookie: key => res.cookie(key, '', { expires: new Date(0) }),

            redirect: (url, status) => status ? res.redirect(status, url) : res.redirect(url),
            setResHeaders: headers => res.set(headers),
            setResStatus: code => res.status(code),
            getRequest: () => req as unknown as IncomingMessage,
            getResponse: () => res as unknown as ServerResponse,
          } as ExpressCtx

          const context = new Context(contextData)
          if (http.headers)
            res.set(http.headers)

          await context.run({
            globalGuards, globalInterceptors, globalFilter, globalPipe,
          }, (returnData) => {
            if (res.writableEnded)
              return
            if (typeof returnData === 'string')
              res.send(returnData)

            else
              res.json(returnData)
          }, (err) => {
            if (res.writableEnded)
              return
            res.status(err.status).json(err)
          })
        })
      }
    }
  }
}
