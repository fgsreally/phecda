import type { Express, Request, Response, Router } from 'express'
import { argToReq, resolveDep } from '../helper'
import { IS_DEV, MERGE_SYMBOL, META_SYMBOL, MODULE_SYMBOL, PS_SYMBOL } from '../../common'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { Meta } from '../../meta'
import { Context, isAopDepInject } from '../../context'
import type { P } from '../../types'
import { HMR } from '../../hmr'

export interface ExpressCtx extends P.HttpContext {
  type: 'express'
  request: Request
  response: Response
  next: Function
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

export function bind(router: Router, { moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, options: Options = {}) {
  const { globalGuards, globalInterceptors, route, plugins } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], plugins: [], ...options } as Required<Options>
  function detect() {
    IS_DEV && isAopDepInject(meta, {
      plugins,
      guards: globalGuards,
      interceptors: globalInterceptors,
    })
  }
  (router as any)[PS_SYMBOL] = { moduleMap, meta }

  const originStack = router.stack.slice(0, router.stack.length)
  const metaMap = new Map<string, Record<string, Meta>>()
  function handleMeta() {
    metaMap.clear()
    for (const item of meta) {
      const { tag, method, http } = item.data
      if (!http?.type)
        continue
      if (metaMap.has(tag))
        metaMap.get(tag)![method] = item

      else
        metaMap.set(tag, { [method]: item })
    }
  }

  async function createRoute() {
    (router as Express).post(route, (req, _res, next) => {
      (req as any)[MERGE_SYMBOL] = true;
      (req as any)[MODULE_SYMBOL] = moduleMap;
      (req as any)[META_SYMBOL] = meta

      next()
    }, ...Context.usePlugin(plugins), async (req, res, next) => {
      const { body } = req

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
            const { tag, method } = item
            const meta = metaMap.get(tag)![method]
            if (!meta)
              return resolve(await Context.filterRecord.default(new BadRequestException(`"${tag}" doesn't exist`)))

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
              type: 'express' as const,
              request: req,
              index: i,
              meta,
              response: res,
              moduleMap,
              tag,
              method,
              next,
              data: (req as any).data,
              ...argToReq(params, item.args, req.headers),
            }
            const context = new Context<ExpressCtx>(contextData)

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
              const funcData = await instance[method](...args)
              resolve(await context.usePostInterceptor(funcData))
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
      const { method, http, header, tag } = i.data

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
      } = metaMap.get(tag)![method];

      (router as Express)[http.type](http.route, (req, _res, next) => {
        (req as any)[MODULE_SYMBOL] = moduleMap;
        (req as any)[META_SYMBOL] = meta
        next()
      }, ...Context.usePlugin(plugins), async (req, res, next) => {
        const instance = moduleMap.get(tag)!
        const contextData = {
          type: 'express' as const,
          request: req,
          meta: i,
          response: res,
          moduleMap,
          parallel: false,
          tag,
          method,
          query: req.query,
          body: req.body,
          params: req.params,
          headers: req.headers,
          data: (req as any).data,
          next,
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
            return { arg: resolveDep(context.data[type], key), pipeOpts, pipe, key, type, index, reflect: paramsType[index] }
          }))
          if (ctx)
            instance[ctx] = contextData
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
          const err = await context.useFilter(e, filter)
          if (res.writableEnded)
            return
          res.status(err.status).json(err)
        }
      })
    }
  }

  detect()
  handleMeta()
  createRoute()

  HMR(async () => {
    router.stack = originStack// router.stack.slice(0, 1)
    detect()
    handleMeta()
    createRoute()
  })
}
