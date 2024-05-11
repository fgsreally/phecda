import Debug from 'debug'
import { Elysia } from 'elysia'
import type { ServerOptions } from '../helper'
import { argToReq, resolveDep } from '../helper'
import { PS_SYMBOL } from '../../common'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { Meta } from '../../meta'
import { Context, detectAopDep } from '../../context'
import type { P } from '../../types'
import { HMR } from '../../hmr'
const debug = Debug('phecda-server/elysia')
export interface ElysiaCtx extends P.HttpContext {
  type: 'elysia'

}

export function bind(app: Elysia, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, ServerOptions: ServerOptions = {}) {
  const { globalGuards, globalInterceptors, route, plugins } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], plugins: [], ...ServerOptions } as Required<ServerOptions>

  (app as any)[PS_SYMBOL] = { moduleMap, meta }

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
    const parallelRouter = new Elysia()
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
              type: 'hono' as const,
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
              const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
              if (cache !== undefined)
                return resolve(cache)
              const args = await context.usePipe(params.map(({ type, key, pipeOpts, pipe, index }) => {
                return { arg: item.args[index], type, key, pipeOpts, pipe, index, reflect: paramsType[index] }
              })) as any
              if (ctx)
                instance[ctx] = contextData
              const funcData = await instance[func](...args)
              resolve(await context.usePostInterceptor(funcData))
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
      const funcRouter = new Elysia()

      Context.usePlugin(plugins).forEach(p => p(funcRouter))
      // @ts-expect-error todo
      funcRouter[http.type](http.route, async (c) => {
        debug(`invoke method "${func}" in module "${tag}"`)
        const instance = moduleMap.get(tag)!
        const contextData = {
          type: 'elysia' as const,
          context: c,
          meta: i,
          moduleMap,
          parallel: false,
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
          c.set.headers = header
          await context.useGuard([...globalGuards, ...guards])
          const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
          if (cache !== undefined)

            return cache

          const args = await context.usePipe(params.map(({ type, key, pipeOpts, index, pipe }) => {
            return { arg: resolveDep(context.data[type], key), pipeOpts, pipe, key, type, index, reflect: paramsType[index] }
          }))
          if (ctx)
            instance[ctx] = contextData
          const funcData = await instance[func](...args)
          const ret = await context.usePostInterceptor(funcData)

          return ret
        }
        catch (e: any) {
          const err = await context.useFilter(e, filter)

          c.set.status = err.status
          return err
        }
      })

      app.use(funcRouter)
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
    // createRoute()
  })
}
