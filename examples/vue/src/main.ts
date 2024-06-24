import { createApp } from 'vue'
import { createPhecda } from 'phecda-vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPhecda())

app.use(router)

app.mount('#app')
