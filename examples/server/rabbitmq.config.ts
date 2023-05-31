import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
import plugin from 'phecda-client/vite'

export default defineConfig({
  ssr: {
    format: 'cjs',
  },
  server: {
    port: 3699,
    cors: true,
  },
  plugins: [
    plugin({
      parseFile(id) {
        return id.endsWith('?client')
      },
    }),
    VitePluginNode({
      adapter: 'express',
      tsCompiler: 'swc',
      appPath: './src/rabbitmq.ts',
    }),
  ],
})
