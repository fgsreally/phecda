import type { Component, DefineComponent, ExtractPropTypes } from 'vue'
import { defineComponent, h, ref, render, shallowRef } from 'vue'

export const createModal = function (modalWrapper: Component, modelKey = 'modelValue') {
  let isMounted = false
  const isShow = ref(true)
  const content = shallowRef()
  const propsRef = ref<any>({})
  const wrapper = defineComponent({
    setup() {
      return () => h(modalWrapper, {
        [modelKey]: isShow.value,
        [`onUpdate:${modelKey}`]: (v: boolean) => {
          isShow.value = v
        },
      }, {
        default: () => content.value && h(content.value, propsRef.value),
      })
    },
  })

  return <P>(comp: DefineComponent<P, any, any>, props?: ExtractPropTypes<P>) => {
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
