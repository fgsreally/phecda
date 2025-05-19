import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import pc from 'phecda-client/unplugin'
// import swc from 'unplugin-swc'
export default defineConfig({

  plugins: [
    pc.vite({}),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

})
