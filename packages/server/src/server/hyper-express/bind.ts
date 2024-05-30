import type { Request, Response, Router } from 'hyper-express'
import Debug from 'debug'
import type { ServerOptions } from '../helper'
import { argToReq } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { ControllerMeta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { HttpContext } from '../../types'
import { HMR } from '../../hmr'

const debug = Debug('phecda-server/hyper-express')
export interface HyperExpressCtx extends HttpContext {
  type: 'hyper-express'
  request: Request
  response: Response
  next: Function
  app: Router

}

export function bind(router: Router, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, ServerOptions: ServerOptions = {}) {
  const { globalGuards, globalInterceptors, route, plugins } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], plugins: [], ...ServerOptions } as Required<ServerOptions>

  const metaMap = new Map<string, Record<string, ControllerMeta>>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func, controller, http } = item.data
      if (controller !== 'http' || !http?.type)
        continue

      debug(`register method "${func}" in module "${tag}"`)

      item.data.guards = [...globalGuards, ...item.data.guards]
      item.data.interceptors = [...globalInterceptors, ...item.data.interceptors]

      if (metaMap.has(tag))
        metaMap.get(tag)![func] = item as ControllerMeta

      else
        metaMap.set(tag, { [func]: item as ControllerMeta })
    }
  }
  async function createRoute() {
    router.post(route, {
      middlewares: [
        ...Context.usePlugin(plugins),
      ],
    }, async (req, res, next) => {
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
              type: 'hyper-express' as const,
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
            }
            const context = new Context<HyperExpressCtx>(contextData)

            context.run(resolve, resolve)
          })
        })).then((ret) => {
          res.json(ret)
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
            params,
            plugins,
            http,
          },
        } = meta

        if (!http?.type)
          continue
        const needBody = params.some(item => item.type === 'body')

        router[http.type](http.prefix + http.route, ...Context.usePlugin(plugins), async (req, res, next) => {
          debug(`invoke method "${func}" in module "${tag}"`)

          const contextData = {
            type: 'hyper-express' as const,
            request: req,
            meta,
            response: res,
            moduleMap,
            tag,
            func,
            query: req.query_parameters,
            body: needBody ? await req.json({}) : undefined,
            app: router,

            params: req.path_parameters,
            headers: req.headers,
            next,
          }

          const context = new Context<HyperExpressCtx>(contextData)
          if (http.headers) {
            for (const name in http.headers)
              res.set(name, http.headers[name])
          }
          await context.run((returnData) => {
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

  detectAopDep(meta, {
    plugins,
    guards: globalGuards,
    interceptors: globalInterceptors,
  })
  handleMeta()
  createRoute()

  HMR(() => {
    detectAopDep(meta, {
      plugins,
      guards: globalGuards,
      interceptors: globalInterceptors,
    })

    handleMeta()
  })
}
