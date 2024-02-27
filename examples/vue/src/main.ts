import { createApp } from 'vue'
import { createPhecda, storePlugin, watcherPlugin } from 'phecda-vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App).use(createPhecda().use(storePlugin, watcherPlugin))

app.use(router)

app.mount('#app')
