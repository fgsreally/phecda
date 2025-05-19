import { defineConfig } from 'vite'
import swc from 'unplugin-swc'
import plugin from 'phecda-module/vite'
export default defineConfig({
  plugins: [swc.vite(), plugin()],
  define: {
    __DEV__: true,
  },
})
