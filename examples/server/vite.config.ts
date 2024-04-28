import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import plugin from 'phecda-client/vite'
// import swc from 'unplugin-swc'

export default defineConfig({

  server: {
    proxy: {
      '/base': 'http://localhost:3008',
    },
  },
  plugins: [plugin({ split: true, http: './pmeta.js' })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

})
