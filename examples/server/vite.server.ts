import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import plugin from 'unplugin-phecda-server'
export default defineConfig({

  server: {
    proxy: {
      '/base': 'http://localhost:3008',
    },
  },
  plugins: [
    plugin.vite({}),
    // ps.vite(),

  ],

  build: {
    ssr: true,
    lib: {
      entry: './src/server/express.ts',
      formats: ['es'],
      name: 'express',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

})
