import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import plugin from 'phecda-client/vite'
import swc from 'unplugin-swc'

export default defineConfig({

  server: {
    proxy: {
      '/base': 'http://localhost:3007',
    },
  },
  plugins: [swc.vite(), plugin({ split: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

})
