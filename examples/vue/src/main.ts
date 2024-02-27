import { createApp } from 'vue'
import { createPhecda, storagePlugin, watchPlugin } from 'phecda-vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App).use(createPhecda().use(storagePlugin(), watchPlugin()))

app.use(router)

app.mount('#app')
