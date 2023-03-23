export function createIframeHtml(importmap: Record<string, string>) {
  return `${createImportMapStr(importmap)}<div id="app"></div>${createRenderFnStr()}`
}

export function createImportMapStr(importmap: Record<string, string>) {
  return `<script type="importmap">{"imports":${JSON.stringify(importmap)}}</script>`
}

export function createRenderFnStr() {
  return `
    <script  type="module">
    import { defineComponent as _defineComponent } from 'vue'

    import { ref,render,h,createApp } from 'vue'
    
    const __sfc__ = /*#__PURE__*/_defineComponent({
      __name: 'App',
      setup(__props) {
    
    const propsData = ref({})
    let comp = null
    
    window.load = async(url, css) => {
         loadCSS(css)
      const ret=await import(url)
      comp=ret.default
      update({})
    }
    
    window.update=update
    
    function update(data){
       render(h(comp,data),document.body)
    }
      
    async function loadCSS(url){
       const ret=await fetch(url)
       const styleStr=await ret.text()
      let style = document.querySelector('story-css')
      if (!style) {
        style = document.createElement('style')
        style.id ='story-css'
        document.head.appendChild(style)
      }
      style.innerHTML = styleStr
    
    }  
    
    return (_ctx,_cache) => {
      return null
    }
    }
    
    })
    __sfc__.__file = "App.vue"
     
      createApp(__sfc__).mount('#app')
    </script>
    `
}
