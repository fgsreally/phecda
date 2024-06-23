import { createApp } from 'vue'
import { createPhecda } from 'phecda-vue'
import App from './App.vue'
import router from './router'

createPhecda()
const app = createApp(App)

app.use(router)

app.mount('#app')
