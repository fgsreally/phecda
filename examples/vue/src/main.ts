import { createApp } from 'vue'
import { createPhecda } from 'phecda-vue'
import App from './App.vue'
import router from './router'
import { UserModel } from './models/user'

const app = createApp(App)

app.use(await createPhecda([UserModel]))
app.use(router)

app.mount('#app')
