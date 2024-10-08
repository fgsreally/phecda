import Debug from 'debug'
import type { Context as ElysiaContext, InputSchema, LocalHook, RouteSchema, SingletonBase } from 'elysia'
import { Elysia as App } from 'elysia'
import type { BaseMacro } from 'elysia/dist/types'
import type { HttpContext, HttpOptions } from '../types'
import { argToReq } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import { Context } from '../../context'

import { Define } from '../../decorators'
import { createControllerMetaMap, detectAopDep } from '../../helper'
const debug = Debug('phecda-server/elysia')
export interface ElysiaCtx extends HttpContext {
  type: 'elysia'
  app: App
  context: ElysiaContext
}

export type Plugin = (app: App<any>) => void

export function bind(app: App<any>, data: Awaited<ReturnType<typeof Factory>>, opts: HttpOptions = {}) {
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
    Context.usePlugin<Plugin>(globalPlugins, 'elysia').forEach(p => p(app))

    const parallelRouter = new App()
    Context.usePlugin<Plugin>(parallelPlugins, 'elysia').forEach(p => p(parallelRouter))
    if (parallelRoute) {
      parallelRouter.post(parallelRoute, async (c) => {
        const { body } = c

        async function errorHandler(e: any) {
          const error = await Context.filterRecord.default(e)
          c.set.status = error.status
          return error
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
                type: 'elysia' as const,
                parallel: true,
                context: c,
                index: i,
                meta,
                moduleMap,
                tag,
                func,
                app,
                ...argToReq(params, item.args, c.headers),
                getCookie: key => c.cookie[key].value,
                setCookie: (key, value, opts = {}) => c.cookie[key].set({ ...opts, value }),
                delCookie: key => c.cookie[key].remove(),
                redirect: url => c.redirect(url),
                setResHeaders: headers => Object.assign(c.set.headers, headers),
                setResStatus: status => c.set.status = status,
                getRequest: () => {
                  throw new Error('elysia can\'t support getRequest')
                },
                getResponse: () => {
                  throw new Error('elysia can\'t support getResponse')
                },
              } as ElysiaCtx
              const context = new Context(contextData)

              context.run({
                globalGuards, globalInterceptors, globalFilter, globalPipe,
              }, resolve, resolve)
            })
          })).then((ret) => {
            return ret
          })
        }
        catch (e) {
          return errorHandler(e)
        }
      })
    }

    app.use(parallelRouter)
    for (const [tag, record] of metaMap) {
      for (const func in record) {
        const meta = metaMap.get(tag)![func]

        const {
          data: {
            define,

            plugins,
            http,
          },
        } = meta

        const funcRouter = new App()

        if (!http?.type)
          continue

        Context.usePlugin<Plugin>(plugins, 'elysia').forEach(p => p(funcRouter))
        // @ts-expect-error todo
        funcRouter[http.type](http.prefix + http.route, async (c: ElysiaContext) => {
          debug(`invoke method "${func}" in module "${tag}"`)
          const contextData = {
            type: 'elysia' as const,
            context: c,
            meta,
            moduleMap,
            tag,
            func,
            query: c.query,
            body: c.body as any,
            params: c.params,
            headers: c.headers,
            app,
            getCookie: key => c.cookie[key].value,
            setCookie: (key, value, opts = {}) => c.cookie[key].set({ ...opts, value }),
            delCookie: key => c.cookie[key].remove(),
            redirect: url => c.redirect(url),
            setResHeaders: headers => Object.assign(c.set.headers, headers),
            setResStatus: status => c.set.status = status,
            getRequest: () => {
              throw new Error('elysia can\'t support getRequest')
            },
            getResponse: () => {
              throw new Error('elysia can\'t support getResponse')
            },
          } as ElysiaCtx

          const context = new Context(contextData)
          if (http.headers)
            c.set.headers = http.headers

          return context.run({
            globalGuards, globalInterceptors, globalFilter, globalPipe,
          }, returnData => returnData, (err) => {
            c.set.status = err.status
            return err
          })
        }, define.elysia)

        app.use(funcRouter)
      }
    }
  }
}

export function Elysia(opts: LocalHook<InputSchema, RouteSchema, SingletonBase, Record<string, Error>, BaseMacro>) {
  return Define('elysia', opts)
}
