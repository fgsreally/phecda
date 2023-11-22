import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { transformSync } = require('@swc-node/core')

const injectInlineSourceMap = ({ code, map }) => {
  if (map) {
    const base64Map = Buffer.from(map, 'utf8').toString('base64')
    const sourceMapContent = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${base64Map}`
    return `${code}\n${sourceMapContent}`
  }
  return code
}

export function compile(sourcecode, filename) {
  if (filename.endsWith('.d.ts'))
    return ''

  const { code, map } = transformSync(sourcecode, filename, {
    sourcemap: true,

    module: 'es6',
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    esModuleInterop: false,

  })

  return injectInlineSourceMap({ code, map })
}
