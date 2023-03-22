export function createIframeHtml(importmap: Record<string, string>) {
  return `${createImportMapStr(importmap)}<div id="app"></div>${createRenderFnStr()}`
}

export function createImportMapStr(importmap: Record<string, string>) {
  return `<script type="importmap">{"imports":${JSON.stringify(importmap)}}</script>`
}

export function createRenderFnStr() {
  return `
    <script  type="module">
    import {createApp,render,h} from 'vue'
    /* Analyzed bindings: {
        "ref": "setup-const",
        "propsData": "setup-ref",
        "comp": "setup-ref"
      } */
      import { defineComponent as _defineComponent } from 'vue'
      import { resolveDynamicComponent as _resolveDynamicComponent, normalizeProps as _normalizeProps, guardReactiveProps as _guardReactiveProps, openBlock as _openBlock, createBlock as _createBlock } from "vue"
      
      import { ref } from 'vue'
      
      const __sfc__ = /*#__PURE__*/_defineComponent({
        __name: 'App',
        setup(__props) {
      
      const propsData = ref({})
      const comp = ref(null)
      window.update = (data) => propsData.value = data
      window.load = (component, data) => {
        propsData.value = data
        comp.value = component
      }
      
      return (_ctx,_cache) => {
        return (_openBlock(), _createBlock(_resolveDynamicComponent(comp.value), _normalizeProps(_guardReactiveProps(propsData.value)), null, 16 /* FULL_PROPS */))
      }
      }
      
      })
      __sfc__.__file = "App.vue"
     
      createApp(__sfc__).mount('#app')
    </script>
    `
}
