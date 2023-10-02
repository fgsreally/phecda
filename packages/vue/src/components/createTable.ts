import { defineComponent, h, onMounted, ref } from 'vue'
/* eslint-disable vue/one-component-per-file */
import type { Component, DefineComponent } from 'vue'

export function createTable<P extends { $props: any }>(
  compSet: Record<string, Component> | any,
  options: {
    table: Component<P>
    column?: Component | false
    data?: any
    columnSlot?: string
    cellSlot?: string
  },

): DefineComponent<{
  config: Object
} & P['$props']> {
  const { table, column: tableColumn, data, cellSlot = 'default', columnSlot = 'default' } = options
  const TableColumn = defineComponent({
    name: 'PhecdaTableColumn',

    setup(_props, { attrs }) {
      const compName = attrs._component as string
      const childrens: any = attrs._children && {
        default: () => (attrs._children as any[]).map((child: any) => h(tableColumn as any, child)),
      }

      if (tableColumn) {
        return () => h(
          tableColumn as any,
          attrs,
          compName
            ? {
                [`${cellSlot}`]: (scope: any) => {
                  const childrenProps = typeof attrs._props === 'function' ? attrs._props?.(scope) : attrs._props
                  return h(compSet[compName], { data, ...(childrenProps || {}) }, childrenProps?._slots)
                },
              }
            : childrens,
        )
      }
      else {
        return (scope: any) => {
          const childrenProps = typeof attrs._props === 'function' ? attrs._props?.(scope) : attrs._props

          return compName ? h(compSet[compName], { scope, data, ...(childrenProps || {}) }, childrenProps?._slots) : childrens
        }
      }
    }
    ,
  })

  return defineComponent({
    name: 'PhecdaTable',
    props: {
      config: {
        type: Array,
        required: true,
      },
    },
    setup(props, ctx) {
      const dom = ref()
      onMounted(() => {
        ctx.expose({ ...dom.value })
      })
      return () => {
        return h(table as any, Object.assign({ ref: dom }, ctx.attrs), {
          [`${columnSlot}`]: (scope: any) =>
            props.config.map((item: any) => {
              item = typeof item === 'function' ? item(scope) : item
              return h(TableColumn, item)
            }),
        })
      }
    },
  }) as any
}
