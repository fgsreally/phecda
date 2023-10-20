import type { Component } from 'vue'
import { defineComponent, h, render, shallowRef } from 'vue'
import { interval } from '../vue/phecda'

export const createLayer: <T>(wrapComp: Component<T>, props?: Partial<T>, modelKey?: string,) => <P>(comp: Component<P>, props?: P, modalProps?: Partial<T>) => void = function (modalWrapper: Component, content_props: any = {}, modelKey = 'modelValue') {
  let isMounted = false
  const isShow = shallowRef(true)
  const content = shallowRef()
  const contentProps = shallowRef({})
  const modalProps = shallowRef({})
  const wrapper = defineComponent({
    setup() {
      return () => h(modalWrapper, {
        [modelKey]: isShow.value,
        [`onUpdate:${modelKey}`]: (v: boolean) => {
          isShow.value = v
        },
        ...(modalProps.value),
      }, {
        default: () => content.value && h(content.value, contentProps.value),
      })
    },
  })

  return (comp: any, props?: any, modal_props?: any) => {
    content.value = comp
    contentProps.value = props
    modalProps.value = Object.assign({}, content_props, modal_props)
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
