import type { Component } from 'vue'
import { defineComponent, h, render, shallowRef } from 'vue'

export const createLayer: <T>(wrapComp: Component<T>, props?: Partial<T>, modelKey?: string,) => <P>(comp: Component<P>, props?: P) => void = function (modalWrapper: Component, props: any = {}, modelKey = 'modelValue') {
  let isMounted = false
  const isShow = shallowRef(true)
  const content = shallowRef()
  const propsRef = shallowRef<any>({})

  const wrapper = defineComponent({
    setup() {
      return () => h(modalWrapper, {
        [modelKey]: isShow.value,
        [`onUpdate:${modelKey}`]: (v: boolean) => {
          isShow.value = v
        },
        ...(props),
      }, {
        default: () => content.value && h(content.value, propsRef.value),
      })
    },
  })

  return (comp: any, props?: any) => {
    content.value = comp
    propsRef.value = props

    if (!isMounted) {
      const el = document.createElement('div')
      const vnode = h(wrapper)
      document.body.appendChild((render(vnode, el), el))
      isMounted = true
    }
    else {
      isShow.value = true
    }
  }
}
