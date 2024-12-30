import { IncomingMessage, ServerResponse } from 'node:http'
import type { Request, RequestHandler, Response } from 'express'
import { Router } from 'express'
import Debug from 'debug'
import type { HttpCtx, HttpOptions } from '../types'

import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import { AOP, Context } from '../../context'
import { createControllerMetaMap, detectAopDep, joinUrl } from '../../helper'
import { HMR } from '../../hmr'

const debug = Debug('phecda-server/express')
export interface ExpressCtx extends HttpCtx {
  type: 'express'
  request: Request
  response: Response
  next: Function
  app: Router

}

export type Addon = RequestHandler

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

  HMR(async () => {
    router.stack = originStack// router.stack.slice(0, 1)
    registerRoute()
  })

  function registerRoute() {
    Context.applyAddons(globalAddons, router, 'express')

    if (parallelRoute) {
      const subRouter = Router()
      Context.applyAddons(parallelAddons, subRouter, 'express')
      subRouter.use(async (req, res, next) => {
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
              if (!item)
                return resolve(null)

              const { tag, func } = item

              debug(`(parallel)invoke method "${func}" in module "${tag}"`)

              if (!metaMap.has(tag))
                return resolve(await Context.filterRecord.default(new BadRequestException(`module "${tag}" doesn't exist`)))

              const meta = metaMap.get(tag)![func]
              if (!meta)
                return resolve(await Context.filterRecord.default(new BadRequestException(`"${func}" in "${tag}" doesn't exist`)))

              const aop = Context.getAop(meta, {
                globalFilter,
                globalGuards,
                globalPipe,
              })
              const contextData = {
                type: 'express' as const,
                category: 'http',
                parallel: true,
                request: req,
                index: i,
                meta,
                response: res,
                moduleMap,

                next,
                app: router,
                ...item,
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
      router.post(parallelRoute, subRouter)
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

        const subRouter = Router()
        Context.applyAddons(addons, subRouter, 'express')

        subRouter[http.type](joinUrl(http.prefix, http.route), async (req, res, next) => {
          debug(`invoke method "${func}" in module "${tag}"`)

          const contextData = {
            type: 'express' as const,
            category: 'http',
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
