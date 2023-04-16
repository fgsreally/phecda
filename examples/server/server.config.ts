import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
import swc from 'unplugin-swc'

export default defineConfig({
  ssr: {
    format: 'cjs',
  },
  server: {
    port: 3699,
  },
  plugins: [
    swc.vite(),
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/server.ts',
    }),
  ],
})
