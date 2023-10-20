import type { Component } from 'vue'
import { defineComponent, h, render, shallowRef } from 'vue'
import { interval } from '../vue/phecda'

// similar to createLayer
export const createModal: <T1, T2 >(wrapComp: Component<T1>, comp: Component<T2>, opts?: {
  modelKey?: string
  wrapProps?: Partial<T1>
  compProps?: Partial<T2>
}) => (props?: Partial<T2>, modalProps?: Partial<T1>) => void = function (wrapComp: Component, comp: Component, opts = {}) {
  let isMounted = false

  const { modelKey = 'modelValue', wrapProps = {}, compProps = {} } = opts
  const isShow = shallowRef(true)
  const contentProps = shallowRef({})
  const modalProps = shallowRef({})
  const wrapper = defineComponent({
    setup() {
      return () => h(wrapComp, {
        [modelKey]: isShow.value,
        [`onUpdate:${modelKey}`]: (v: boolean) => {
          isShow.value = v
        },
        ...(modalProps.value),
      }, {
        default: () => h(comp, contentProps.value),
      })
    },
  })

  return (props?: any, wrap_props?: any) => {
    contentProps.value = Object.assign({}, compProps, props)
    modalProps.value = Object.assign({}, wrapProps, wrap_props)
    if (!isMounted) {
      const el = document.createElement('div')
      const vnode = h(wrapper)
      vnode.appContext = interval.app?._context
      document.body.appendChild((render(vnode, el), el))
      isMounted = true
    }
    else {
      isShow.value = true
    }
  }
}
