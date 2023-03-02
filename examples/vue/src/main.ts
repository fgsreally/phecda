import { createApp } from 'vue'
import { createPhecda } from 'phecda-core'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)// .use(createPhecda())

app.use(router)

app.mount('#app')
