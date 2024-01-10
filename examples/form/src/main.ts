import { createApp } from 'vue'
import { createPhecda } from 'phecda-vue'
import App from './App.vue'
import 'element-plus/dist/index.css'
import '@arco-design/web-vue/dist/arco.css'

const app = createApp(App)
app.provide('test', 'test')
app.use(createPhecda())
app.mount('#app')
