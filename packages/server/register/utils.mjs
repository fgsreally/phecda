import { transform } from '@swc-node/core'
const injectInlineSourceMap = ({ code, map }) => {
  if (map) {
    const base64Map = Buffer.from(map, 'utf8').toString('base64')
    const sourceMapContent = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${base64Map}`
    return `${code}\n${sourceMapContent}`
  }
  return code
}

export async function compile(sourcecode, filename) {
  if (filename.endsWith('.d.ts'))
    return ''

  const { code, map } = await transform(sourcecode, filename, {
    sourcemap: true,
    module: 'es6',
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    esModuleInterop: false,
  })

  return injectInlineSourceMap({ code, map })
}

export async function genUnImportRet() {
  try {
    const allExports = Object.keys(await import('../dist/index.mjs'))
    const { createUnimport, scanExports } = await import('unimport')

    if (import.meta.resolve('fast-glob')) {
      const { default: fg } = await import('fast-glob')

      const result = await fg('**/*.@(controller|service|module|extension|ext|guard|interceptor|plugin|filter|pipe|edge).ts', {
        absolute: true,
        cwd: process.cwd(),
        onlyFiles: true,
        followSymbolicLinks: true,
      })

      const files = Array.from(new Set(result.flat())).map(slash)
      return (await Promise.all(files.map(i => scanExports(i, false)))).flat()
    }

    return createUnimport({
      imports: allExports.map((k) => {
        return { name: k, from: 'phecda-server' }
      }),
    })
  }
  catch (e) {
    console.log('err', e.message)
    return false
  }
}

function slash(str) {
  return str.replace(/\\/g, '/')
}
