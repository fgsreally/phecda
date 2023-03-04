import { defineComponent, h, onMounted, ref } from 'vue'
/* eslint-disable vue/one-component-per-file */
import type { Component, DefineComponent } from 'vue'

export function createTable<P extends { $props: any }>(
  compSet: Record<string, Component> | any,
  table: Component<P>,
  tableColumn: Component | false,
  data?: any,
): DefineComponent<{
  config: Object
} & P['$props']> {
  const TableColumn = defineComponent({
    name: 'PhecdaTableColumn',
    props: {
      tableColumn: {
        type: Object, required: true,
      },

    },
    setup(props) {
      const compName = props.tableColumn._component
      return () =>
        h(
          tableColumn as any,
          {
            ...props.tableColumn,
          },
          {
            default: (scope: any) => {
              return compName ? h(compSet[compName], { scope, data, ...props.tableColumn._props || {} }) : null
            },
          },
        )
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
          default: () =>
            props.config.map((item: any) => {
              return h(TableColumn as any, {
                tableColumn: item,
              })
            }),
        })
      }
    },
  }) as any
}
