import type { PluginOption } from 'vite'
export function Story(): PluginOption {
  return {
    name: 'phecda-story',
    transformIndexHtml() {
      return {
        html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <link rel="icon" href="/favicon.ico">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Phecda Story</title>
          </head>
          <body>
            <div id="app"></div>
          </body>
        </html>
            `,
        tags: [{
          tag: 'script',
          attrs: { type: 'module', src: '/virtual-story' },
          injectTo: 'body',
        }],
      }
    },
  }
}
