import { defineComponent, h, onMounted, ref } from 'vue'
/* eslint-disable vue/one-component-per-file */
import type { Component, DefineComponent } from 'vue'

export function createForm<P extends { $props: any }>(
  compSet: Record<string, Component> | any,
  form: Component<P>,
  formItem: Component | false,
  options: {
    modelKey?: string
    onUpdate?: (key: string) => void
  } = {},
): DefineComponent<{
  config: Object
  data: Object
} & P['$props']> {
  const { modelKey = 'modelValue', onUpdate } = options

  function generateChildVNode(props: any) {
    return props._children?.map((item: any) =>
      item._active === false ? null : h((compSet as any)[item._component], item),
    )
  }

  function generateVNode(props: any) {
    const { property } = props
    return h(
      compSet[props.config[property]._component],
      {
        ...props.config[property],
        [`${modelKey}`]: props.data[property],
        [`onUpdate:${modelKey}`]: (v: any) => {
          props.data[property] = v
          onUpdate?.(property)
        },
      },
      {
        default: () =>
          generateChildVNode(props.config[props.property]),
      },
    )
  }

  const FormItem = defineComponent({
    name: 'CustomFormItem',
    props: {
      formItem: { type: Object },
      config: {
        type: Object,
        required: true,
      },
      data: {
        type: Object,
        required: true,
      },
      property: {
        type: String,
        required: true,
      },
    },
    setup(props) {
      return () => {
        return formItem
          ? h(
            formItem as any,
            {
              ...props.formItem,
            },
            {
              default: () => {
                return generateVNode(props)
              },
            },
          )
          : generateVNode(props)
      }
    },
  })

  return defineComponent({
    name: 'CustomForm',
    props: {
      config: {
        type: Object,
        required: true,
      },
      data: {
        type: Object,
        required: true,
      },
    },
    setup(props, ctx) {
      const dom = ref()
      onMounted(() => {
        ctx.expose({ ...dom.value })
      })
      return () => {
        return h(form as any, Object.assign({ ref: dom }, ctx.attrs), {
          default: () =>
            Object.keys(props.config).map((item) => {
              return props.config[item as any]._active === false
                ? null
                : h(FormItem, {
                  formItem: props.config[item]._formItem,
                  config: props.config,
                  property: item,
                  data: props.data,
                })
            }), // .filter(item => !(props.config[item as any]._active === false)),
        })
      }
    },
  }) as any
}
