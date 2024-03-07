import type { Express, Request, Response, Router } from 'express'
import { resolveDep } from '../../helper'
import { APP_SYMBOL, IS_DEV, MERGE_SYMBOL, META_SYMBOL, MODULE_SYMBOL } from '../../common'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { Meta } from '../../meta'
import { Context, isAopDepInject } from '../../context'
import type { P } from '../../types'

export interface ExpressCtx extends P.BaseContext {
  type: 'express'
  request: Request
  response: Response
  parallel: boolean

}
export interface Options {

  /**
 * 专用路由的值，默认为/__PHECDA_SERVER__，处理phecda-client发出的合并请求
 */
  route?: string
  /**
 * 全局守卫
 */
  globalGuards?: string[]
  /**
 * 全局拦截器
 */
  globalInterceptors?: string[]
  /**
 * 专用路由的插件(work for merge request)，
 */
  plugins?: string[]

}

export function bindApp(app: Router, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, options: Options = {}) {
  const { globalGuards, globalInterceptors, route, plugins } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], plugins: [], ...options } as Required<Options>
  IS_DEV && isAopDepInject(meta, {
    plugins,
    guards: globalGuards,
    interceptors: globalInterceptors,
  });

  (app as any)[APP_SYMBOL] = { moduleMap, meta }

  const metaMap = new Map<string, Meta>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, method, http } = item.data
      if (!http?.type)
        continue
      const methodTag = `${tag}-${method}`
      metaMap.set(methodTag, item)
    }
  }

  async function createRoute() {
    (app as Express).post(route, (req, _res, next) => {
      (req as any)[MERGE_SYMBOL] = true;
      (req as any)[MODULE_SYMBOL] = moduleMap;
      (req as any)[META_SYMBOL] = meta

      next()
    }, ...Context.usePlugin(plugins), async (req, res) => {
      const { body } = req

      async function errorHandler(e: any) {
        const error = await Context.filterRecord.default(e)
        return res.status(error.status).json(error)
      }

      if (!Array.isArray(body))
        return errorHandler(new BadRequestException('data format should be an array'))

      try {
        return Promise.all(body.map((item: any) => {
          // eslint-disable-next-line no-async-promise-executor
          return new Promise(async (resolve) => {
            const { tag } = item
            const meta = metaMap.get(tag)
            if (!meta)
              return resolve(await Context.filterRecord.default(new BadRequestException(`"${tag}" doesn't exist`)))

            const contextData = {
              type: 'express' as const,
              request: req,
              meta,
              response: res,
              moduleMap,
              parallel: true,
              tag,
            }
            const context = new Context<ExpressCtx>(contextData)
            const [name, method] = tag.split('-')
            const {
              paramsType,
              handlers,
              data: {
                params,
                guards, interceptors,
                filter,
              },
            } = meta

            const instance = moduleMap.get(name)

            try {
              await context.useGuard([...globalGuards, ...guards])
              const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
              if (cache !== undefined)
                return resolve(cache)
              const args = await context.usePipe(params.map(({ type, key, pipeOpts, pipe, index }) => {
                return { arg: item.args[index], type, key, pipeOpts, pipe, index, reflect: paramsType[index] }
              })) as any
              instance.context = contextData
              const funcData = await moduleMap.get(name)[method](...args)
              resolve(await context.usePostInterceptor(funcData))
            }
            catch (e: any) {
              handlers.forEach(handler => handler.error?.(e))
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
      const { method, http, header, tag } = i.data

      if (!http?.type)
        continue

      const methodTag = `${tag}-${method}`

      const {
        paramsType,
        handlers,
        data: {
          interceptors,
          guards,
          params,
          plugins,
          filter,
        },
      } = metaMap.get(methodTag)!;

      (app as Express)[http.type](http.route, (req, _res, next) => {
        (req as any)[MODULE_SYMBOL] = moduleMap;
        (req as any)[META_SYMBOL] = meta
        next()
      }, ...Context.usePlugin(plugins), async (req, res) => {
        const instance = moduleMap.get(tag)!
        const contextData = {
          type: 'express' as const,
          request: req,
          meta: i,
          response: res,
          moduleMap,
          parallel: false,
          tag: methodTag,
        }

        const context = new Context<ExpressCtx>(contextData)

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
          const args = await context.usePipe(params.map(({ type, key, pipeOpts, index, pipe }) => {
            return { arg: resolveDep((req as any)[type], key), pipeOpts, pipe, key, type, index, reflect: paramsType[index] }
          }))

          instance.context = contextData
          const funcData = await instance[method](...args)
          const ret = await context.usePostInterceptor(funcData)

          if (res.writableEnded)
            return

          if (typeof ret === 'string')
            res.send(ret)

          else
            res.json(ret)
        }
        catch (e: any) {
          handlers.forEach(handler => handler.error?.(e))
          const err = await context.useFilter(e, filter)
          if (res.writableEnded)
            return
          res.status(err.status).json(err)
        }
      })
    }
  }

  handleMeta()
  createRoute()
  if (IS_DEV) {
    globalThis.__PS_HMR__?.push(async () => {
      isAopDepInject(meta, {
        plugins,
        guards: globalGuards,
        interceptors: globalInterceptors,
      })
      app.stack = []// app.stack.slice(0, 1)
      handleMeta()
      createRoute()
    })
  }
}
