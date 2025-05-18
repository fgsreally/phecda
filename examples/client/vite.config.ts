import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
// import swc from 'unplugin-swc'
export default defineConfig({

    server: {
        proxy: {
            '/base': 'http://localhost:3008',
        },
    },


    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },

})