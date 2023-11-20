import type { Express, Router } from 'express'
import { Context, ServerContext, parseMeta } from '../context'
import { isObject } from '../utils'
import { resolveDep } from '../helper'
import { MERGE_SYMBOL, SERIES_SYMBOL } from '../common'
import type { Factory } from '../core'
import { BadRequestException } from '../exception'
import type { Meta } from '../meta'
import type { ServerMergeCtx } from '../types'

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
 * 专用路由的中间件(work for merge request)，全局中间件请在bindApp以外设置
 */
  middlewares?: string[]
}

export function bindApp(app: Express | Router, { meta, moduleMap }: Awaited<ReturnType<typeof Factory>>, options: Options = {}) {
  const { globalGuards, globalInterceptors, route, middlewares: proMiddle } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], middlewares: [], ...options } as Required<Options>
  const contextMeta = {} as Record<string, Meta>
  (app as Express).post(route, (req, _res, next) => {
    (req as any)[MERGE_SYMBOL] = true
    next()
  }, ...ServerContext.useMiddleware(proMiddle), async (req, res) => {
    const { body: { category, data } } = req

    const contextData = {
      request: req,
      response: res,
      meta: contextMeta,
      moduleMap,
      isMerge: true,
    } as unknown as ServerMergeCtx

    if (!Array.isArray(data))
      return res.json(await ServerContext.useFilter(new BadRequestException('data format should be an array'), contextData))

    if (category !== 'series' && category !== 'parallel')
      return res.json(await ServerContext.useFilter(new BadRequestException('category should be \'parallel\' or \'series\''), contextData))

    contextData.tags = data.map((item: any) => item.tag)

    const context = new ServerContext(route, contextData)
    const ret = [] as any[]
    try {
      const mergeGuards = new Set([...globalGuards])
      const mergeInterceptors = new Set([...globalInterceptors])

      data.forEach(({ tag }) => {
        const {
          guards,
          interceptors,
        } = Context.metaDataRecord[tag]
        guards.forEach(guard => mergeGuards.add(guard))
        interceptors.forEach(intercept => mergeInterceptors.add(intercept))
      })
      await context.useGuard([...mergeGuards], true)
      await context.useInterceptor([...mergeInterceptors], true)

      if (category === 'series') {
        for (const item of data) {
          const { tag } = item
          const [name, method] = tag.split('-')
          const {
            reflect,
            params,
          } = Context.metaDataRecord[tag]
          const instance = moduleMap.get(name)

          try {
            if (!params)
              throw new BadRequestException(`"${tag}" doesn't exist`)
            const args = await context.usePipe(params.map(({ type, key, option, index }) => {
              const arg = resolveDep(item[type], key)
              if (typeof arg === 'string' && arg.startsWith(SERIES_SYMBOL)) {
                const [, argIndex, argKey] = arg.split('@')
                return { arg: resolveDep(ret[Number(argIndex)], argKey || key), option, index, type, key, reflect: reflect[index] }
              }

              return { arg, option, index, type, key, reflect: reflect[index] }
            }), tag) as any
            instance.context = contextData

            ret.push(await moduleMap.get(name)[method](...args))
          }
          catch (e: any) {
            const m = Context.metaRecord[tag]
            m.handlers.forEach(handler => handler.error?.(e))
            ret.push(await context.useFilter(e))
          }
        }
        return res.json(await context.usePost(ret))
      }
      if (category === 'parallel') {
        return Promise.all(data.map((item: any) => {
          // eslint-disable-next-line no-async-promise-executor
          return new Promise(async (resolve) => {
            const { tag } = item
            const [name, method] = tag.split('-')
            const {
              reflect,
              params,
              handlers,
            } = Context.metaDataRecord[tag]

            const instance = moduleMap.get(name)

            try {
              if (!params)
                throw new BadRequestException(`"${tag}" doesn't exist`)

              const args = await context.usePipe(params.map(({ type, key, option, index }) => {
                const arg = resolveDep(item[type], key)
                return { arg, type, key, option, index, reflect: reflect[index] }
              }), tag) as any
              instance.context = contextData
              resolve(await moduleMap.get(name)[method](...args))
            }
            catch (e: any) {
              handlers.forEach(handler => handler.error?.(e))
              resolve(await context.useFilter(e))
            }
          })
        })).then(async (ret) => {
          res.json(await context.usePost(ret))
        })
      }
    }
    catch (e) {
      const err = await context.useFilter(e)
      res.status(err.status).json(err)
    }
  })
  for (const i of meta) {
    const { method, route, header, tag } = i.data
    const methodTag = `${tag}-${method}`
    contextMeta[methodTag] = i
    Context.metaRecord[methodTag] = i
    let {
      guards,
      reflect,
      interceptors,
      params,
      handlers,
      middlewares,
    } = Context.metaDataRecord[methodTag] ? Context.metaDataRecord[methodTag] : (Context.metaDataRecord[methodTag] = parseMeta(i))

    guards = [...globalGuards!, ...guards]
    interceptors = [...globalInterceptors!, ...interceptors]

    if (route) {
      (app as Express)[route.type](route.route, ...ServerContext.useMiddleware(middlewares), async (req, res) => {
        const instance = moduleMap.get(tag)!
        const contextData = {
          request: req,
          meta: i,
          response: res,
          moduleMap,
        }
        const context = new ServerContext(methodTag, contextData)

        try {
          for (const name in header)
            res.set(name, header[name])
          await context.useGuard(guards)
          await context.useInterceptor(interceptors)
          const args = await context.usePipe(params.map(({ type, key, option, index }) => {
            return { arg: resolveDep((req as any)[type], key), option, key, type, index, reflect: reflect[index] }
          }), methodTag)
          instance.context = contextData

          const ret = await context.usePost(await instance[method](...args))
          if (isObject(ret))
            res.json(ret)
          else
            res.send(String(ret))
        }
        catch (e: any) {
          handlers.forEach(handler => handler.error?.(e))
          const err = await context.useFilter(e)
          res.status(err.status).json(err)
        }
      })
    }
  }
}
