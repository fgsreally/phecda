import type { to } from './composable'
import { emitter } from './emitter'
import type { PhecdaHandler } from './types'

// 一个类挂载第一个phecda装饰器时，会创建对应的，类似元数据的东西
function init(target: any) {
  if (!target._namespace) {
    target._namespace = {
      /**
       * @Init 事件,
       * 引入Model时就会执行
      */
      __INIT_EVENT__: new Set(),
      /**
       * 暴露的变量，
       * 只要属性上存在至少一个装饰器，该属性就会被捕捉到
      */
      __EXPOSE_VAR__: new Set(),
      /**
       * @Ignore 绑定的属性，
       * 某属性即使被捕捉，可被强行忽略，优先级最高
      */
      __IGNORE_VAR__: new Set(),
      /**
       * 存在状态的变量
      */
      __STATE_VAR__: new Set(),
      /**
       * 状态变量的处理器
      */

      __STATE_HANDLER__: new Map(),
    }
  }
}

export function regisInitEvent(target: any, key: string) {
  init(target)
  target._namespace.__INIT_EVENT__.add(key)
}

export function getInitEvent(target: any) {
  init(target)
  return [...target._namespace.__INIT_EVENT__] as string[]
}

export function setModalState(target: any, key: PropertyKey) {
  init(target)
  target._namespace.__STATE_VAR__.add(key)
  // 绑定状态的值，均属于暴露的值
  setExposeKey(target, key)
}

export function setExposeKey(target: any, key: PropertyKey) {
  init(target)
  target._namespace.__EXPOSE_VAR__.add(key)
}

export function setIgnoreKey(target: any, key: PropertyKey) {
  init(target)
  target._namespace.__IGNORE_VAR__.add(key)
}
export function getModelState(target: any) {
  init(target)
  return [...target._namespace.__STATE_VAR__].reverse() as string[]
}

export function getExposeKey(target: any) {
  init(target)
  return [...target._namespace.__EXPOSE_VAR__] as string[]
}

export function getIgnoreKey(target: any) {
  init(target)
  return [...target._namespace.__IGNORE_VAR__] as string[]
}

export function regisHandler(target: any, key: PropertyKey, handler: PhecdaHandler) {
  init(target)
  if (!target._namespace.__STATE_HANDLER__.has(key))
    target._namespace.__STATE_HANDLER__.set(key, [handler])

  else
    target._namespace.__STATE_HANDLER__.get(key).push(handler)
}

export function getHandler(target: any, key: PropertyKey) {
  return target._namespace.__STATE_HANDLER__.get(key) || []
}

export function Init(target: any, key: string) {
  setModalState(target, key)
  regisHandler(target, key, {
    async init(instance: any) {
      instance[key]()
    },
  })
}

export function Rule(rule: RegExp | string | Function | number,
  info: string,
  meta?: any) {
  return (obj: any, key: string) => {
    setModalState(obj, key)
    regisHandler(obj, key, {
      rule,
      info,
      meta,
    })
  }
}

export function Ignore(target: any, key: string) {
  setIgnoreKey(target, key)
}

export function Clear(target: any, key: string) {
  init(target)

  target._namespace.__INIT_EVENT__.delete(key)
  target._namespace.__EXPOSE_VAR__.delete(key)
  target._namespace.__IGNORE_VAR__.delete(key)
  target._namespace.__STATE_VAR__.delete(key)
  target._namespace.__STATE_HANDLER__.delete(key)
}

export function Err<Fn extends (...args: any) => any>(cb: Fn) {
  return (target: any, key: PropertyKey) => {
    setModalState(target, key)
    regisHandler(target, key, {
      error: cb,
    })
  }
}

export function Get(target: any, key: string) {
  setExposeKey(target, key)
}

export function Pipe(v: ReturnType<typeof to>) {
  return (obj: any, key: string) => {
    setModalState(obj, key)
    regisHandler(obj, key, {
      async pipe(instance: any) {
        const tasks = v.value
        for (const task of tasks)
          instance[key] = await task(instance[key])
      },
    })
  }
}

export function Watcher(eventName: string) {
  return (obj: any, key: string) => {
    setModalState(obj, key)
    regisHandler(obj, key, {
      init(instance: any) {
        emitter.on(eventName, instance[key].bind(instance))
      },
    })
  }
}

export function Tag(tag: string) {
  return (target: any) => {
    target.prototype._symbol = tag
  }
}

export function Storage(target: any) {
  init(target.prototype)
  const tag = target.prototype._symbol
  const uniTag = Symbol(tag)
  setModalState(target.prototype, uniTag)
  regisHandler(target.prototype, uniTag, {
    init: (instance: any) => {
      const { state } = instance

      window.addEventListener('beforeunload', () => {
        // const storageObj: Record<string, any> = {}
        // for (const i in state) {
        //   // eslint-disable-next-line no-prototype-builtins
        //   if (instance.hasOwnProperty(i))
        //     storageObj[i] = state[i]
        // }

        localStorage.setItem(`_phecda_${tag}`, JSON.stringify(state))
      })
      const lastObjStr = localStorage.getItem(`_phecda_${tag}`)
      if (lastObjStr && lastObjStr !== 'undefined') {
        const lastObj = JSON.parse(lastObjStr)
        for (const i in lastObj)
          state[i] = lastObj[i]
      }
    },
  })
}
