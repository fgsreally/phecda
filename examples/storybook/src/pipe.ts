import type { Component } from 'vue'
import { h } from 'vue'
export function Pipe(comp: Component[], props: any, slot?: any) {
  const vnode = h(comp, props, slot)
  return {
    to(comp: Component[], props: any, to = 'default') {
      return Pipe(comp, props, { [`${to}`]: vnode })
    },
    get() {
      return vnode
    },
  }
}
