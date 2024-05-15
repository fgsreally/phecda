import type { Request, Response, Router } from 'hyper-express'
import Debug from 'debug'
import type { ServerOptions } from '../helper'
import { argToReq, resolveDep } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { Meta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { HttpContext } from '../../types'
import { HMR } from '../../hmr'

const debug = Debug('phecda-server/hyper-express')
export interface HyperExpressCtx extends HttpContext {
  type: 'hyper-express'
  request: Request
  response: Response
  next: Function
}

export function bind(router: Router, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, ServerOptions: ServerOptions = {}) {
  const { globalGuards, globalInterceptors, route, plugins } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], plugins: [], ...ServerOptions } as Required<ServerOptions>

  const metaMap = new Map<string, Record<string, Meta>>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func, http } = item.data
      if (!http?.type)
        continue

      debug(`register method "${func}" in module "${tag}"`)

      if (metaMap.has(tag))
        metaMap.get(tag)![func] = item

      else
        metaMap.set(tag, { [func]: item })
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
              paramsType,

              data: {
                ctx,
                params,
                guards, interceptors,
                filter,
              },
            } = meta

            const instance = moduleMap.get(tag)

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
              data: (req as any).data,
              ...argToReq(params, item.args, req.headers),
            }
            const context = new Context<HyperExpressCtx>(contextData)

            try {
              await context.useGuard([...globalGuards, ...guards])
              const i1 = await context.useInterceptor([...globalInterceptors, ...interceptors])
              if (i1 !== undefined)
                return resolve(i1)
              const args = await context.usePipe(params.map(({ type, key, defaultValue, pipe, index }) => {
                return { arg: item.args[index], type, key, defaultValue, pipe, index, reflect: paramsType[index] }
              })) as any
              if (ctx)
                instance[ctx] = contextData
              const funcData = await instance[func](...args)
              const i2 = await context.usePostInterceptor(funcData)
              if (i2 !== undefined)
                return resolve(i2)
              resolve(funcData)
            }
            catch (e: any) {
              resolve(await context.useFilter(e, filter))
            }
          })
        })).then((ret) => {
          res.json(ret)
        })
      }
      catch (e) {
        return errorHandler(e)
      }
    })
    for (const i of meta) {
      const { func, http, header, tag } = i.data

      if (!http?.type)
        continue

      const {
        paramsType,
        data: {
          ctx,
          interceptors,
          guards,
          params,
          plugins,
          filter,
        },
      } = metaMap.get(tag)![func]

      const needBody = params.some(item => item.type === 'body')

      router[http.type](http.route, ...Context.usePlugin(plugins), async (req, res, next) => {
        debug(`invoke method "${func}" in module "${tag}"`)

        const instance = moduleMap.get(tag)!
        const contextData = {
          type: 'hyper-express' as const,
          request: req,
          meta: i,
          response: res,
          moduleMap,
          tag,
          func,
          query: req.query_parameters,
          body: needBody ? await req.json({}) : undefined,

          params: req.path_parameters,
          headers: req.headers,
          data: (req as any).data,
          next,
        }

        const context = new Context<HyperExpressCtx>(contextData)

        try {
          for (const name in header)
            res.set(name, header[name])
          await context.useGuard([...globalGuards, ...guards])
          const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
          if (cache !== undefined) {
            if (typeof cache === 'string')
              res.send(cache)

            else
              res.json(cache)

            return
          }
          const args = await context.usePipe(params.map(({ type, key, defaultValue, index, pipe }) => {
            return { arg: resolveDep(context.data[type], key), defaultValue, pipe, key, type, index, reflect: paramsType[index] }
          }))
          if (ctx)
            instance[ctx] = contextData
          const funcData = await instance[func](...args)
          const i2 = await context.usePostInterceptor(funcData)
          if (i2 !== undefined)
            return i2
          if (res.writableEnded)
            return

          if (typeof funcData === 'string')
            res.send(funcData)

          else
            res.json(funcData)
        }
        catch (e: any) {
          const err = await context.useFilter(e, filter)
          if (res.writableEnded)
            return
          res.status(err.status).json(err)
        }
      })
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
