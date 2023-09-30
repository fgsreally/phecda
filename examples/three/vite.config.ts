import { defineConfig } from 'vite'
import swc from 'unplugin-swc'

export default defineConfig({
  plugins: [swc.vite()],
  define: {
    __DEV__: true,
  },
})
