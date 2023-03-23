// unplugin-vue:D:\MyProject\1\dubhe\examples\esbuild-pub\src\HelloWorld.vue?vue&type=script&setup=true&lang.ts
import { defineComponent as _defineComponent } from 'vue'
import { createElementBlock as _createElementBlock, openBlock as _openBlock, popScopeId as _popScopeId, pushScopeId as _pushScopeId, toDisplayString as _toDisplayString } from 'vue'
const _hoisted_1 = { id: 'esbuild-r-hello' }
const HelloWorld_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ _defineComponent({
  __name: 'HelloWorld',
  props: {
    msg: { type: String, required: true },
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock(
        'h1',
        _hoisted_1,
        _toDisplayString(__props.msg),
        1,
        /* TEXT */
      )
    }
  },
})

// src/virtual:dubhe-injectstyle
function injectStyle(styleStr, id) {
  let style = document.querySelector(`#dubhe-style-${id}`)
  if (!style) {
    style = document.createElement('style')
    style.id = `dubhe-style-${id}`
    document.head.appendChild(style)
  }
  style.innerHTML = styleStr
}

// unplugin-vue:D:\MyProject\1\dubhe\examples\esbuild-pub\src\HelloWorld.vue?vue&type=style&index=0&scoped=6c3d77f0&lang.css
injectStyle(`
#esbuild-r-hello[data-v-6c3d77f0] {
  color: rgb(235, 52, 15);
}

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRDovTXlQcm9qZWN0LzEvZHViaGUvZXhhbXBsZXMvZXNidWlsZC1wdWIvc3JjL0hlbGxvV29ybGQudnVlIiwibWFwcGluZ3MiOiI7QUFjQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ2YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3pCIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIkQ6XFxNeVByb2plY3RcXDFcXGR1YmhlXFxleGFtcGxlc1xcZXNidWlsZC1wdWJcXHNyY1xcSGVsbG9Xb3JsZC52dWUiXSwic291cmNlc0NvbnRlbnQiOlsiXG4jZXNidWlsZC1yLWhlbGxvW2RhdGEtdi02YzNkNzdmMF0ge1xuICBjb2xvcjogcmdiKDIzNSwgNTIsIDE1KTtcbn1cbiJdfQ==`, '7f359284')

// unplugin-vue:/plugin-vue/export-helper
const export_helper_default = (sfc, props) => {
  const target = sfc.__vccOpts || sfc
  for (const [key, val] of props)
    target[key] = val

  return target
}

// src/HelloWorld.vue
const HelloWorld_default = /* @__PURE__ */ export_helper_default(HelloWorld_vue_vue_type_script_setup_true_lang_default, [['__scopeId', 'data-v-6c3d77f0'], ['__file', 'D:\\MyProject\\1\\dubhe\\examples\\esbuild-pub\\src\\HelloWorld.vue']])

export {
  injectStyle,
  export_helper_default,
  HelloWorld_default as default,
}
