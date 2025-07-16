import type { FastifyInstance, FastifyPluginCallback, FastifyPluginOptions, FastifyRegisterOptions, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify'
import Debug from 'debug'
import type { HttpCtx, HttpOptions } from '../types'

import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import { AOP, Context } from '../../context'
import { Define } from '../../decorators'
import { createControllerMetaMap, detectAopDep, joinUrl } from '../../helper'
const debug = Debug('phecda-server/fastify')
export interface FastifyCtx extends HttpCtx {
  type: 'fastify'
  request: FastifyRequest
  response: FastifyReply
  app: FastifyInstance

}

export type Addon = FastifyPluginCallback

export function bind(fastify: FastifyInstance, data: Awaited<ReturnType<typeof Factory>>, opts: HttpOptions & { fastifyOpts?: FastifyRegisterOptions<FastifyPluginOptions> } = {}) {
  const { globalGuards, parallelRoute = '/__PHECDA_SERVER__', globalAddons = [], parallelAddons = [], globalFilter, globalPipe, fastifyOpts, dynamic = false } = opts
  const {
    moduleMap, meta,
  } = data

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

  fastify.register(async (fastify, _, done) => {
    Context.applyAddons(globalAddons, fastify, 'fastify')

    if (parallelRoute) {
      fastify.register(async (fastify, _opts, done) => {
        Context.applyAddons(parallelAddons, fastify, 'fastify')

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
                  type: 'fastify' as const,
                  category: 'http',

                  parallel: true,
                  request: req,
                  index: i,
                  meta,
                  response: res,
                  moduleMap,

                  app: fastify,
                  ...item,
                  // @ts-expect-error need @fastify/cookie
                  getCookie: key => req.cookies[key],
                  // @ts-expect-error need @fastify/cookie
                  setCookie: (key, value, opts) => res.setCookie(key, value, opts),
                  // @ts-expect-error need @fastify/cookie
                  delCookie: key => res.clearCookie(key),
                  redirect: (url, status) => res.redirect(url, status),
                  setResHeaders: headers => res.headers(headers),
                  setResStatus: code => res.status(code),
                  getRequest: () => req.raw,
                  getResponse: () => res.raw,

                } as FastifyCtx
                const context = new Context(contextData)
                context.run(aop, resolve, resolve)
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
    }

    for (const [tag, record] of metaMap) {
      for (const method in record) {
        const meta = metaMap.get(tag)![method]
        const {
          data: {

            addons,

            define,
            http,
          },
        } = meta

        if (!http?.method)
          continue

        fastify.register(async (fastify, _opts, done) => {
          Context.applyAddons(addons, fastify, 'fastify')

          let aop: AOP

          if (!dynamic) {
            aop = Context.getAop(meta, {
              globalFilter,
              globalGuards,
              globalPipe,
            })
          }

          fastify[http.method](joinUrl(http.prefix, http.route), define?.fastify || {}, async (req, res) => {
            debug(`invoke method "${method}" in module "${tag}"`)

            const contextData = {
              type: 'fastify' as const,
              category: 'http',
              request: req,
              meta,
              response: res,
              moduleMap,
              tag,
              method,
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
              delCookie: key => res.clearCookie(key, { url: '' }),
              redirect: (url, status) => res.redirect(url, status),
              setResHeaders: headers => res.headers(headers),
              setResStatus: code => res.status(code),
              getRequest: () => req.raw,
              getResponse: () => res.raw,

            } as FastifyCtx

            const context = new Context(contextData)
            if (http.headers)
              res.headers(http.headers)

            if (dynamic) {
              aop = Context.getAop(meta, {
                globalFilter,
                globalGuards,
                globalPipe,
              })
            }
            return context.run(aop, (returnData) => {
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
