import { createApp } from 'vue'
import { createPhecda } from 'phecda-vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App).use(createPhecda('snap'))

app.use(router)

app.mount('#app')

app.unmount()
