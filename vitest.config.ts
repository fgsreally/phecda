import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'

export default defineConfig({
  plugins: [swc.vite()],
  resolve: {
    alias: {
      amqplib: 'mock-amqplib',
      ioredis: 'ioredis-mock',
    },
  },
  test: {
    environment: 'jsdom',
  },
})
