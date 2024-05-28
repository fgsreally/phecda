import Debug from 'debug'
import type { Context as ElysiaContext, InputSchema, LocalHook, RouteSchema, SingletonBase } from 'elysia'
import { Elysia as App } from 'elysia'
import type { BaseMacro } from 'elysia/dist/types'
import type { ServerOptions } from '../helper'
import { argToReq, resolveDep } from '../helper'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { ControllerMeta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { HttpContext } from '../../types'
import { HMR } from '../../hmr'
import { Define } from '../../decorators'
const debug = Debug('phecda-server/elysia')
export interface ElysiaCtx extends HttpContext {
  type: 'elysia'
  context: ElysiaContext
}

export function bind(app: App<any>, data: Awaited<ReturnType<typeof Factory>>, ServerOptions: ServerOptions = {}) {
  const { globalGuards, globalInterceptors, route, plugins } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], plugins: [], ...ServerOptions } as Required<ServerOptions>
  const { moduleMap, meta } = data
  const metaMap = new Map<string, Record<string, ControllerMeta>>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, func, controller, http } = item.data
      if (controller !== 'http' || !http?.type)
        continue

      debug(`register method "${func}" in module "${tag}"`)

      if (metaMap.has(tag))
        metaMap.get(tag)![func] = item as ControllerMeta

      else
        metaMap.set(tag, { [func]: item as ControllerMeta })
    }
  }

  async function createRoute() {
    const parallelRouter = new App()
    Context.usePlugin(plugins).forEach(p => p(parallelRouter))
    parallelRouter.post(route, async (c) => {
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
              type: 'elysia' as const,
              parallel: true,
              context: c,
              index: i,
              meta,
              moduleMap,
              tag,
              func,
              data: (c as any).data,
              ...argToReq(params, item.args, c.headers),
            }
            const context = new Context<ElysiaCtx>(contextData)

            try {
              await context.useGuard([...globalGuards, ...guards])
              const i1 = await context.useInterceptor([...globalInterceptors, ...interceptors])
              if (i1 !== undefined)
                return resolve(i1)
              const args = await context.usePipe(params.map((param) => {
                return { arg: item.args[param.index], reflect: paramsType[param.index], ...param }
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
          return ret
        })
      }
      catch (e) {
        return errorHandler(e)
      }
    })

    app.use(parallelRouter)
    for (const [tag, record] of metaMap) {
      for (const func in record) {
        const meta = metaMap.get(tag)![func]

        const {
          paramsType,
          data: {
            ctx,
            define,
            interceptors,
            guards,
            params,
            plugins,
            filter,
            http,
          },
        } = meta

        const funcRouter = new App()

        if (!http?.type)
          continue

        Context.usePlugin(plugins).forEach(p => p(funcRouter))
        // @ts-expect-error todo
        funcRouter[http.type](http.prefix + http.route, async (c) => {
          debug(`invoke method "${func}" in module "${tag}"`)
          const instance = moduleMap.get(tag)!
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
            data: c.data,
          }

          const context = new Context<ElysiaCtx>(contextData)

          try {
            if (http.headers)
              c.set.headers = http.headers
            await context.useGuard([...globalGuards, ...guards])
            const i1 = await context.useInterceptor([...globalInterceptors, ...interceptors])
            if (i1 !== undefined)

              return i1

            const args = await context.usePipe(params.map((param) => {
              return { arg: resolveDep(context.data[param.type], param.key), reflect: paramsType[param.index], ...param }
            }))
            if (ctx)
              instance[ctx] = contextData
            const funcData = await instance[func](...args)
            const i2 = await context.usePostInterceptor(funcData)
            if (i2 !== undefined)
              return i2
            return funcData
          }
          catch (e: any) {
            const err = await context.useFilter(e, filter)

            c.set.status = err.status
            return err
          }
        }, define.elysia)

        app.use(funcRouter)
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

  HMR(async () => {
    detectAopDep(meta, {
      plugins,
      guards: globalGuards,
      interceptors: globalInterceptors,
    })
    handleMeta()
  })
}

export function Elysia(opts: LocalHook< InputSchema, RouteSchema, SingletonBase, Record<string, Error>, BaseMacro>) {
  return Define('elysia', opts)
}
