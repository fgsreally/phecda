import Theme from 'vitepress/theme'
import { h } from 'vue'
import Home from './components/Home.vue'

export default {
  ...Theme,
  Layout() {
    return h(Home, null)
  },
  enhanceApp() {
    // @ts-expect-error miss vite type
    if (!import.meta.env.SSR) {
      const el = document.createElement('script')
      el.type = 'module'
      el.src = 'https://unpkg.com/@splinetool/viewer@1.0.38/build/spline-viewer.js'
      document.body.append(el)
    }
  },
}
