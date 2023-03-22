import { createPhecda } from 'phecda-vue'
import type { App } from 'vue'
import { createApp } from 'vue'
export async function init(cb: (app: App) => void) {
  const app = createApp(Comp).use(createPhecda())
  await cb(app)

  app.mount('#app')
}
