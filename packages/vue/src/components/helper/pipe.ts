import type { Component, VNode } from 'vue'
import { h } from 'vue'
export function createPipe<Props extends { $props: any }>(comp: Component<Props>, props: Props['$props'] & { [key in string]: any }, to = 'default', slot?: any): PipeRet {
  const vnodeMap = { [`${to}`]: () => h(comp, props, slot) }
  return {
    to(comp: Component, props: any, to = 'default') {
      return createPipe(comp, props, to, vnodeMap)
    },
    get() {
      return vnodeMap
    },
    bind(vnode: VNode, to: string) {
      vnodeMap[to] = () => vnode
    },
  } as unknown as PipeRet
}

interface PipeRet {
  to: <Props extends { $props: any }>(comp: Component<Props>, props: Props['$props'] & { [key in string]: any }, to: string) => PipeRet
  get: Record<string, () => VNode>
}
