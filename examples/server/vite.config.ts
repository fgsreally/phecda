import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import plugin from 'phecda-client/vite'

export default defineConfig({
  plugins: [plugin({ split: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

})
