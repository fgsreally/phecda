import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import { Server } from 'phecda-server'

export default defineConfig({
  plugins: [Server('meta.p.js')],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {

  },
})
