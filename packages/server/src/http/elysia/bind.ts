import Debug from 'debug'
import type { Context as ElysiaContext, LocalHook } from 'elysia'
import { Elysia as App } from 'elysia'
import type { HttpCtx, HttpOptions } from '../types'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import { AOP, Context } from '../../context'
import { Define } from '../../decorators'
import { createControllerMetaMap, detectAopDep, joinUrl } from '../../helper'
const debug = Debug('phecda-server/elysia')
export interface ElysiaCtx extends HttpCtx {
  type: 'elysia'
  app: App
  context: ElysiaContext
}

export type Addon = (app: App<any>) => void

export function bind(app: App<any>, data: Awaited<ReturnType<typeof Factory>>, opts: HttpOptions = {}) {
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

  function registerRoute() {
    Context.applyAddons(globalAddons, app, 'elysia')

    if (parallelRoute) {
      const parallelRouter = new App()

      Context.applyAddons(parallelAddons, app, 'elysia')

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
                globalGuards,
                globalFilter,
                globalPipe,
              })

              const contextData = {
                type: 'elysia' as const,
                category: 'http',
                parallel: true,
                context: c,
                index: i,
                meta,
                moduleMap,
                app,
                ...item,
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

              context.run(aop, resolve, resolve)
            })
          })).then((ret) => {
            return ret
          })
        }
        catch (e) {
          return errorHandler(e)
        }
      })

      app.use(parallelRouter)
    }

    for (const [tag, record] of metaMap) {
      for (const method in record) {
        const meta = metaMap.get(tag)![method]

        const {
          data: {
            define,

            addons,
            http,
          },
        } = meta

        const subApp = new App({ prefix: '' })

        if (!http?.method)
          continue

        let aop: AOP
        if (!dynamic) {
          aop = Context.getAop(meta, {
            globalFilter,
            globalGuards,
            globalPipe,
          })
        }
        Context.applyAddons(addons, subApp, 'elysia');
        (subApp as any)[http.method](joinUrl(http.prefix, http.route), async (c: ElysiaContext) => {
          debug(`invoke method "${method}" in module "${tag}"`)
          const contextData = {
            type: 'elysia' as const,
            category: 'http',
            context: c,
            meta,
            moduleMap,
            tag,
            method,
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
          if (dynamic) {
            aop = Context.getAop(meta, {
              globalFilter,
              globalGuards,
              globalPipe,
            })
          }
          const context = new Context(contextData)
          if (http.headers)
            c.set.headers = http.headers

          if (dynamic) {
            aop = Context.getAop(meta, {
              globalFilter,
              globalGuards,
              globalPipe,
            })
          }
          return context.run(aop, returnData => returnData, (err) => {
            c.set.status = err.status
            return err
          })
        }, define.elysia)

        app.use(subApp)
      }
    }
  }
}

export function Elysia(opts: LocalHook<any, any, any, any, any, any>) {
  return Define('elysia', opts)
}
