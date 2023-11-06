import type { Component } from 'vue'
import { defineComponent, h, render, shallowRef } from 'vue'
import { interval } from '../vue/phecda'

export const createDialog: <T >(comp: Component<T>, opts?: {
  modelKey?: string
  props?: Partial<T>
}) => (props?: Partial<T>) => void = function (comp: Component, opts = {}) {
  let isMounted = false

  const { modelKey = 'modelValue', props = {} } = opts
  const isShow = shallowRef(true)
  const contentProps = shallowRef({})
  const wrapper = defineComponent({
    setup() {
      return () => h(comp, {
        [modelKey]: isShow.value,
        [`onUpdate:${modelKey}`]: (v: boolean) => {
          isShow.value = v
        },
        ...(contentProps.value),
      })
    },
  })

  return (_props = {}) => {
    contentProps.value = Object.assign({}, props, _props)
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
