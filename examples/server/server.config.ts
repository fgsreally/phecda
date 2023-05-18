import { defineConfig, normalizePath } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
export default defineConfig({
  ssr: {
    format: 'cjs',
  },
  server: {
    port: 3699,
    cors: true,
  },
  plugins: [
    VitePluginNode({
      adapter: 'express',
      tsCompiler: 'swc',
      appPath: './src/server.ts',
    }),
  ],
})
