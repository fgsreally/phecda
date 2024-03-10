import { createApp } from 'vue'
import { createPhecda, defaultWebInject } from 'phecda-vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

defaultWebInject()
const app = createApp(App).use(createPhecda())

app.use(router)

app.mount('#app')
