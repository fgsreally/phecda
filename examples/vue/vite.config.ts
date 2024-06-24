import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import swc from 'unplugin-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),

    swc.vite({
    })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
