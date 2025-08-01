import { IncomingMessage, ServerResponse } from 'node:http'
import { MiddlewareHandler, Request, Response, Router } from 'hyper-express'
import Debug from 'debug'
import type { HttpCtx, HttpOptions } from '../types'

import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import { AOP, Context } from '../../context'
import { createControllerMetaMap, detectAopDep, joinUrl } from '../../helper'

const debug = Debug('phecda-server/hyper-express')
export interface HyperExpressCtx extends HttpCtx {
  type: 'hyper-express'
  request: Request
  response: Response
  next: Function
  app: Router

}

export type Addon = MiddlewareHandler

export function bind(router: Router, data: Awaited<ReturnType<typeof Factory>>, opts: HttpOptions = {}) {
  const { globalGuards, parallelRoute = '/__PHECDA_SERVER__', globalAddons = [], parallelAddons = [], globalFilter, globalPipe, dynamic = false } = opts

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
  async function registerRoute() {
    Context.applyAddons(globalAddons, router, 'hyper-express')
    if (parallelRoute) {
      const subRouter = new Router()

      subRouter.post(parallelRoute, async (req, res, next) => {
        const body = await req.json()

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
                type: 'hyper-express' as const,
                category: 'http',
                parallel: true,
                request: req,
                index: i,
                meta,
                response: res,
                moduleMap,

                app: router,
                ...item,
                next,
                getCookie: key => req.cookies[key],
                setCookie: (key, value, opts) => res.cookie(key, value, opts?.expires && opts.expires.getTime() - Date.now(), opts || {}),
                delCookie: key => res.clearCookie(key),
                redirect: url => res.redirect(url),
                setResHeaders: headers => res.set(headers),
                setResStatus: code => res.status(code),
                getRequest: () => req as unknown as IncomingMessage,
                getResponse: () => res as unknown as ServerResponse,
              } as HyperExpressCtx
              const context = new Context(contextData)

              context.run(aop, resolve, resolve)
            })
          })).then((ret) => {
            res.json(ret)
          })
        }
        catch (e) {
          return errorHandler(e)
        }
      })

      router.use(subRouter)
    }

    for (const [tag, record] of metaMap) {
      for (const method in record) {
        const meta = metaMap.get(tag)![method]

        const {
          data: {
            params,
            addons,
            http,
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
        const subRouter = new Router()
        Context.applyAddons(addons, subRouter, 'hyper-express')
        subRouter[http.method](joinUrl(http.prefix, http.route), async (req, res, next) => {
          debug(`invoke method "${method}" in module "${tag}"`)

          const contextData = {
            type: 'hyper-express' as const,
            category: 'http',
            request: req,
            meta,
            response: res,
            moduleMap,
            tag,
            method,
            query: req.query_parameters,
            body: needBody ? await req.json({}) : undefined,
            app: router,

            params: req.path_parameters,
            headers: req.headers,
            next,
            getCookie: key => req.cookies[key],
            setCookie: (key, value, opts) => res.cookie(key, value, opts?.expires && opts.expires.getTime() - Date.now(), opts || {}),
            delCookie: key => res.clearCookie(key),
            redirect: url => res.redirect(url),
            setResHeaders: headers => res.set(headers),
            setResStatus: code => res.status(code),
            getRequest: () => req as unknown as IncomingMessage,
            getResponse: () => res as unknown as ServerResponse,

          } as HyperExpressCtx

          const context = new Context(contextData)
          if (http.headers) {
            for (const name in http.headers)
              res.set(name, http.headers[name])
          }
          if (dynamic) {
            aop = Context.getAop(meta, {
              globalFilter,
              globalGuards,
              globalPipe,
            })
          }
          await context.run(aop, (returnData) => {
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

        router.use(subRouter)
      }
    }
  }
}
