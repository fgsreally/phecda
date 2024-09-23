import { IncomingMessage, ServerResponse } from 'node:http'
import type { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions, FastifyRegisterOptions, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
import Debug from 'debug'
import type { HttpContext, HttpOptions } from '../types'
import { argToReq } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import { Context } from '../../context'
import { Define } from '../../decorators'
import { createControllerMetaMap, detectAopDep } from '../../helper'
const debug = Debug('phecda-server/fastify')
export interface FastifyCtx extends HttpContext {
  type: 'fastify'
  request: FastifyRequest
  response: FastifyReply
  app: FastifyInstance

}

export type Plugin = FastifyPluginCallback

export function bind(fastify: FastifyInstance, data: Awaited<ReturnType<typeof Factory>>, opts: HttpOptions & { fastifyOpts?: FastifyRegisterOptions<FastifyPluginOptions> } = {}) {
  const { globalGuards, globalInterceptors, parallelRoute = '/__PHECDA_SERVER__', globalPlugins = [], parallelPlugins = [], globalFilter, globalPipe, fastifyOpts } = opts
  const {
    moduleMap, meta,
  } = data

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

  fastify.register((fastify, _, done) => {
    Context.usePlugin<Plugin>(globalPlugins, 'fastify').forEach((p) => {
      (p as any)[Symbol.for('skip-override')] = true
      fastify.register(p)
    })
    fastify.register((fastify, _opts, done) => {
      Context.usePlugin<Plugin>(parallelPlugins, 'fastify').forEach((p) => {
        (p as any)[Symbol.for('skip-override')] = true
        fastify.register(p)
      })
      if (parallelRoute) {
        fastify.post(parallelRoute, async (req, res) => {
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
                  type: 'fastify' as const,
                  parallel: true,
                  request: req,
                  index: i,
                  meta,
                  response: res,
                  moduleMap,
                  tag,
                  func,
                  app: fastify,

                  ...argToReq(params, item.args, req.headers),
                  // @ts-expect-error need @fastify/cookie
                  getCookie: key => req.cookies[key],
                  // @ts-expect-error need @fastify/cookie
                  setCookie: (key, value, opts) => res.setCookie(key, value, opts),
                  // @ts-expect-error need @fastify/cookie
                  delCookie: key => res.clearCookie(key),
                  redirect: (url, status) => res.redirect(url, status),
                  setResHeaders: headers => res.headers(headers),
                  setResStatus: code => res.status(code),
                  getRequest: () => req as unknown as IncomingMessage,
                  getResponse: () => res as unknown as ServerResponse,
                } as FastifyCtx
                const context = new Context(contextData)
                context.run({
                  globalGuards, globalInterceptors, globalFilter, globalPipe,
                }, resolve, resolve)
              })
            })).then((ret) => {
              res.send(ret)
            })
          }
          catch (e) {
            return errorHandler(e)
          }
        })
      }

      done()
    })
    for (const [tag, record] of metaMap) {
      for (const func in record) {
        const meta = metaMap.get(tag)![func]
        const {
          data: {

            plugins,

            define,
            http,
          },
        } = meta

        if (!http?.type)
          continue

        fastify.register((fastify, _opts, done) => {
          Context.usePlugin<Plugin>(plugins, 'fastify').forEach((p) => {
            (p as any)[Symbol.for('skip-override')] = true

            fastify.register(p)
          })

          fastify[http.type](http.prefix + http.route, define?.fastify || {}, async (req, res) => {
            debug(`invoke method "${func}" in module "${tag}"`)

            const contextData = {
              type: 'fastify' as const,
              request: req,
              meta,
              response: res,
              moduleMap,
              tag,
              func,
              query: req.query as any,
              body: req.body as any,
              params: req.params as any,
              headers: req.headers,
              app: fastify,
              // @ts-expect-error need @fastify/cookie
              getCookie: key => req.cookies[key],
              // @ts-expect-error need @fastify/cookie
              setCookie: (key, value, opts) => res.setCookie(key, value, opts),
              // @ts-expect-error need @fastify/cookie
              delCookie: key => res.clearCookie(key, { path: '' }),
              redirect: (url, status) => res.redirect(url, status),
              setResHeaders: headers => res.headers(headers),
              setResStatus: code => res.status(code),
              getRequest: () => req as unknown as IncomingMessage,
              getResponse: () => res as unknown as ServerResponse,
            } as FastifyCtx

            const context = new Context(contextData)
            if (http.headers)
              res.headers(http.headers)

            return context.run({
              globalGuards, globalInterceptors, globalFilter, globalPipe,
            }, (returnData) => {
              if (res.sent)
                return
              return returnData
            }, (err) => {
              if (res.sent)
                return
              res.status(err.status).send(err)
            })
          })
          done()
        })
      }
    }

    done()
  }, fastifyOpts)
}

export function Fastify(opts: RouteShorthandOptions) {
  return Define('fastify', opts)
}
