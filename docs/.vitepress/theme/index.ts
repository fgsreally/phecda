import Theme from 'vitepress/theme'
import { h } from 'vue'
import Home from './components/Home.vue'

export default {
  ...Theme,
  Layout() {
    return h(Home, null)
  },

}
