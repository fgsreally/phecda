import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import plugin from 'phecda-server/vite'

export default defineConfig({
  plugins: [plugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {

  },
})
