// import type { EffectScope } from 'vue'
// import { effectScope, onUnmounted, reactive } from 'vue'
import type { Emitter, Handler } from 'mitt'
import type { PhecdaEvents, PhecdaHandler, PhecdaNameSpace } from './types'
import { getHandler, getModelState } from './decorators'
import { emitter } from './emitter'

export class Phecda {
  protected static __PHECDA_EMIT__: Emitter<PhecdaEvents>
  protected static __PHECDA_NAMESPACE__: PhecdaNameSpace
  protected static __PHECDA_MODEL__: string[]
  protected _symbol: string
  protected _namespace: { __INIT_EVENT__: Set<PropertyKey>; __STATE_VAR__: Set<PropertyKey>; __STATE_HANDLER__: Map<PropertyKey, PhecdaHandler> }
  // _emitter: Emitter<PhecdaEvents> = window.__PHECDA_EMIT__
  constructor() {
    if (!this._symbol)
      throw new Error('phecda miss tag')

    if (!Phecda.__PHECDA_MODEL__) {
      Phecda.__PHECDA_MODEL__ = []
      Phecda.__PHECDA_NAMESPACE__ = {}
      Phecda.__PHECDA_EMIT__ = emitter
    }
  }

  on<Key extends keyof PhecdaEvents>(type: Key, handler: Handler<PhecdaEvents[Key]>): void {
    Phecda.__PHECDA_EMIT__.on(type, handler)
  }

  emit(type: keyof PhecdaEvents, event: PhecdaEvents[keyof PhecdaEvents]) {
    Phecda.__PHECDA_EMIT__.emit(type, event)
  }

  off<Key extends keyof PhecdaEvents>(type: Key, handler?: Handler<PhecdaEvents[Key]>): void {
    Phecda.__PHECDA_EMIT__.off(type, handler)
  }
}

export class PhecdaWeb extends Phecda {
  constructor() {
    super()
    // 初始化，创建事件总线，命名空间等,相当于全局
    if (!window.__PHECDA_EMIT__) {
      window.__PHECDA_EMIT__ = Phecda.__PHECDA_EMIT__
      window.__PHECDA_MODEL__ = Phecda.__PHECDA_MODEL__
      window.__PHECDA_NAMESPACE__ = Phecda.__PHECDA_NAMESPACE__
    }
    // if (Phecda.__PHECDA_NAMESPACE__[this._symbol])
    //   return Phecda.__PHECDA_NAMESPACE__[this._symbol] as PhecdaWeb
  }
}

// export class PhecdaVue extends PhecdaWeb {
//   protected _scope: EffectScope
//   protected static __PHECDA_EMIT__: Emitter<PhecdaEvents>
//   protected static __PHECDA_NAMESPACE__: PhecdaNameSpace
//   protected static __PHECDA_MODEL__: string[]
//   public state = reactive({})
//   constructor() {
//     super()

//     // 同symbol 为单例
//     if (Phecda.__PHECDA_NAMESPACE__[this._symbol])
//       return Phecda.__PHECDA_NAMESPACE__[this._symbol] as PhecdaVue
//     // 新创建时 往命名空间添加 model
//     if (this._symbol) {
//       window.__PHECDA_MODEL__.push(this._symbol)
//       window.__PHECDA_NAMESPACE__[this._symbol] = this
//     }

//     this._scope = effectScope()
//     this.start(true)
//   }

//   vOn<Key extends keyof PhecdaEvents>(type: Key, handler: Handler<PhecdaEvents[Key]>): void {
//     super.on(type, handler)

//     onUnmounted(() => {
//       Phecda.__PHECDA_EMIT__.off(type, handler)
//     })
//   }

//   start(isFirstTime = false) {
//     this._scope.run(() => {
//       register(this, isFirstTime)
//     })
//   }

//   dispose() {
//     this._scope.stop()
//   }
// }

// export class PhecdaNode extends Phecda {
//   constructor() {
//     super()

//     if (Phecda.__PHECDA_NAMESPACE__[this._symbol])
//       return Phecda.__PHECDA_NAMESPACE__[this._symbol] as PhecdaNode

//     this.start(true)
//   }

//   start(isFirstTime = false) {
//     register(this, isFirstTime)
//   }

//   dispose() {
//     PhecdaNode.__PHECDA_EMIT__.off('*')
//   }
// }
