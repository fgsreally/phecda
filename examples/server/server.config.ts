import { URL, fileURLToPath, pathToFileURL } from 'node:url'

import fs from 'fs'
import { isAbsolute } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      name: 'ps',
      async config() {
        const { initialize } = await import(
          'phecda-server/register/loader.mjs'
        )

        await initialize()
      },
      async resolveId(id, i) {
        if (id.includes('node_modules'))
          return
        const { resolve } = await import('phecda-server/register/loader.mjs')
        const { url } = await resolve(
          id,
          { parentURL: i && pathToFileURL(i).href },
          () => {
            return {}
          },
        )

        if (url) {
          if (new URL(url).protocol === 'file:')
            return fileURLToPath(url)
          return url
        }
      },
      async load(id) {
        if (!isAbsolute(id))
          return
        if (id.includes('node_modules'))
          return

        const { load } = await import('phecda-server/register/loader.mjs')

        const { source } = await load(id, {}, async () => {
          const source = await fs.promises.readFile(id)
          return {
            source,
          }
        })

        return Buffer.from(source).toString()
      },
    },
  ],

  build: {
    // lib: {
    //   entry: './src/server/express.ts',
    //   formats: ['es'],
    //   name: 'express',
    // },

    ssr: './src/server/express.ts',
    rollupOptions: {
      input: './src/server/express.ts',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
