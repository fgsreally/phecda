import { createApp } from 'vue'
import { createPhecda } from 'phecda-vue'
import App from './App.vue'
import router from './router'
import { UserModel } from './models/user'

const app = createApp(App)
const phecda = createPhecda([UserModel])
console.log(await phecda)
console.log(phecda.then)

console.log(await phecda)
console.log(phecda.then)

app.use(await phecda)
app.use(router)

console.log('before mount')
app.mount('#app')
