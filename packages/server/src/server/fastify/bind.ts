import type { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
import type { ServerOptions } from '../helper'
import { argToReq, resolveDep } from '../helper'
import { META_SYMBOL, MODULE_SYMBOL, PS_SYMBOL } from '../../common'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { Meta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { P } from '../../types'
import { HMR } from '../../hmr'
import { log } from '../../utils'
import { Define } from '../../decorators'
export interface FastifyCtx extends P.HttpContext {
  type: 'fastify'
  request: FastifyRequest
  response: FastifyReply
}

export function bind(app: FastifyInstance, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, ServerOptions: ServerOptions = {}): FastifyPluginCallback {
  const { globalGuards, globalInterceptors, route, plugins } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], plugins: [], ...ServerOptions } as Required<ServerOptions>
  (app as any).server[PS_SYMBOL] = { moduleMap, meta }

  const metaMap = new Map<string, Record<string, Meta>>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, method, http, guards, interceptors } = item.data
      if (!http?.type)
        continue

      log(`"${method}" in "${tag}": `)
      detectAopDep(meta, {
        plugins,
        guards,
        interceptors,
      })
      if (metaMap.has(tag))
        metaMap.get(tag)![method] = item

      else
        metaMap.set(tag, { [method]: item })
    }
  }

  detectAopDep(meta, {
    plugins,
    guards: globalGuards,
    interceptors: globalInterceptors,
  })
  handleMeta()

  HMR(async () => {
    detectAopDep(meta, {
      plugins,
      guards: globalGuards,
      interceptors: globalInterceptors,
    })
    handleMeta()
  })

  return (fastify, _, done) => {
    (fastify as any)[PS_SYMBOL] = {
      moduleMap, meta,
    }

    fastify.decorateRequest('data', {})
    fastify.decorateRequest(MODULE_SYMBOL)
    fastify.decorateRequest(META_SYMBOL)

    fastify.register((fastify, _opts, done) => {
      plugins.forEach((p) => {
        const plugin = Context.usePlugin([p])[0]
        if (plugin) {
          plugin[Symbol.for('skip-override')] = true

          fastify.register(plugin)
        }
      })
      fastify.post(route, async (req, res) => {
        const { body } = req as any

        async function errorHandler(e: any) {
          const error = await Context.filterRecord.default(e)
          return res.status(error.status).send(error)
        }

        if (!Array.isArray(body))
          return errorHandler(new BadRequestException('data format should be an array'))

        try {
          return Promise.all(body.map((item: any, i) => {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise(async (resolve) => {
              const { tag, method } = item
              const meta = metaMap.get(tag)![method]

              if (!meta)
                return resolve(await Context.filterRecord.default(new BadRequestException(`"${tag}" doesn't exist`)))

              const {
                paramsType,

                data: {
                  ctx,
                  params,
                  guards,
                  interceptors,
                  filter,
                },
              } = meta

              const instance = moduleMap.get(tag)
              const contextData = {
                type: 'fastify' as const,
                request: req,
                index: i,
                meta,
                response: res,
                moduleMap,
                tag,
                method,
                data: (req as any).data,

                ...argToReq(params, item.args, req.headers),

              }
              const context = new Context<FastifyCtx>(contextData)
              try {
                if (!params)
                  throw new BadRequestException(`"${tag}" doesn't exist`)
                await context.useGuard([...globalGuards, ...guards])
                const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
                if (cache !== undefined)

                  return resolve(cache)

                const args = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }) => {
                  return { arg: item.args[index], type, key, pipe, pipeOpts, index, reflect: paramsType[index] }
                })) as any
                if (ctx)
                  instance[ctx] = contextData
                const funcData = await instance[method](...args)
                resolve(await context.usePostInterceptor(funcData))
              }
              catch (e: any) {
                resolve(await context.useFilter(e, filter))
              }
            })
          })).then((ret) => {
            res.send(ret)
          })
        }
        catch (e) {
          return errorHandler(e)
        }
      })

      done()
    })

    for (const i of meta) {
      const { method, http, header, tag } = i.data

      if (!http?.type)
        continue

      const {
        paramsType,
        data: {
          interceptors,
          guards,
          params,
          plugins,
          filter,
          ctx,
          define,
        },
      } = metaMap.get(tag)![method]

      fastify.register((fastify, _opts, done) => {
        Context.usePlugin(plugins).forEach((p) => {
          p[Symbol.for('skip-override')] = true

          fastify.register(p)
        })

        fastify[http.type](http.route, define?.fastify || {}, async (req, res) => {
          (req as any)[MODULE_SYMBOL] = moduleMap;
          (req as any)[META_SYMBOL] = meta
          const instance = moduleMap.get(tag)!
          const contextData = {
            type: 'fastify' as const,
            request: req,
            meta: i,
            response: res,
            moduleMap,
            tag,
            method,
            query: req.query as any,
            body: req.body as any,
            params: req.params as any,
            headers: req.headers,
            data: (req as any).data,

          }
          const context = new Context<FastifyCtx>(contextData)

          try {
            for (const name in header)
              res.header(name, header[name])
            await context.useGuard([...globalGuards, ...guards])
            const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
            if (cache !== undefined)

              return cache

            const args = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }) => {
              return { arg: resolveDep(context.data[type], key), pipe, pipeOpts, key, type, index, reflect: paramsType[index] }
            }))

            if (ctx)
              instance[ctx] = contextData
            const funcData = await instance[method](...args)
            const ret = await context.usePostInterceptor(funcData)
            if (res.sent)
              return

            return ret
          }
          catch (e: any) {
            const err = await context.useFilter(e, filter)

            if (res.sent)
              return
            res.status(err.status).send(err)
          }
        })
        done()
      })
    }

    done()
  }
}

export function Fastify(opts: RouteShorthandOptions) {
  return Define('fastify', opts)
}
