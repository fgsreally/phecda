import type { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'
import { resolveDep } from '../../helper'
import { APP_SYMBOL, IS_DEV, META_SYMBOL, MODULE_SYMBOL } from '../../common'
import type { Factory } from '../../core'
import { BadRequestException } from '../../exception'
import type { Meta } from '../../meta'
import { Context, isAopDepInject } from '../../context'

export interface FastifyCtx {
  type: 'fastify'
  request: FastifyRequest
  response: FastifyReply
  meta: Meta
  moduleMap: Record<string, any>
  [key: string]: any
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

export function bindApp({ moduleMap, meta }: Awaited<ReturnType<typeof Factory>>, options: Options = {}): FastifyPluginCallback {
  const { globalGuards, globalInterceptors, route, plugins } = { route: '/__PHECDA_SERVER__', globalGuards: [], globalInterceptors: [], plugins: [], ...options } as Required<Options>
  //   (app as any)[APP_SYMBOL] = { moduleMap, meta }

  isAopDepInject(meta, {
    plugins,
    guards: globalGuards,
    interceptors: globalInterceptors,
  })

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

  handleMeta()

  return (fastify, _, done) => {
    (fastify as any)[APP_SYMBOL] = {
      moduleMap, meta,
    }
    // fastify.decorateRequest(MODULE_SYMBOL, null)
    // fastify.decorateRequest(META_SYMBOL, null)
    // fastify.decorateRequest(MERGE_SYMBOL, false)

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
          const error = await Context.filter(e)
          return res.status(error.status).send(error)
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
                return resolve(await Context.filter(new BadRequestException(`"${tag}" doesn't exist`)))

              const contextData = {
                type: 'fastify',
                request: req,
                meta,
                response: res,
                moduleMap,
                parallel: true,

              }
              const context = new Context(tag, contextData)
              const [name, method] = tag.split('-')
              const {
                paramsType,

                handlers,

                data: {
                  params,
                  guards, interceptors,
                },
              } = meta

              const instance = moduleMap.get(name)

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
                instance.context = contextData
                const funcData = await moduleMap.get(name)[method](...args)
                resolve(await context.usePostInterceptor(funcData))
              }
              catch (e: any) {
                handlers.forEach(handler => handler.error?.(e))
                resolve(await context.useFilter(e))
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

      const methodTag = `${tag}-${method}`

      const {
        paramsType,
        handlers,
        data: {
          interceptors,
          guards,
          params,
          plugins,
        },
      } = metaMap.get(methodTag)!

      fastify.register((fastify, _opts, done) => {
        Context.usePlugin(plugins).forEach((p) => {
          p[Symbol.for('skip-override')] = true

          fastify.register(p)
        })
        fastify[http.type](http.route, async (req, res) => {
          (req as any)[MODULE_SYMBOL] = moduleMap;
          (req as any)[META_SYMBOL] = meta
          const instance = moduleMap.get(tag)!
          const contextData = {
            type: 'fastify',
            request: req,
            meta: i,
            response: res,
            moduleMap,
          }
          const context = new Context(methodTag, contextData)

          try {
            for (const name in header)
              res.header(name, header[name])
            await context.useGuard([...globalGuards, ...guards])
            const cache = await context.useInterceptor([...globalInterceptors, ...interceptors])
            if (cache !== undefined)

              return cache

            const args = await context.usePipe(params.map(({ type, key, pipe, pipeOpts, index }) => {
              return { arg: resolveDep((req as any)[type], key), pipe, pipeOpts, key, type, index, reflect: paramsType[index] }
            }))

            instance.context = contextData
            const funcData = await instance[method](...args)
            const ret = await context.usePostInterceptor(funcData)
            if (res.sent)
              return

            return ret
          }
          catch (e: any) {
            handlers.forEach(handler => handler.error?.(e))
            const err = await context.useFilter(e)
            res.status(err.status).send(err)
          }
        })
        done()
      })
    }

    done()

    if (IS_DEV) {
      globalThis.__PS_HMR__?.push(async () => {
        handleMeta()
      })
    }
  }
}
