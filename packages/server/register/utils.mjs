import { isAbsolute } from 'path'
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

export async function genUnImportRet(opts) {
  try {
    const psExports = Object.keys(await import('../dist/index.mjs'))
    const { createUnimport } = await import('unimport')
    return createUnimport({
      ...opts,
      imports: psExports
        .map((k) => {
          return { name: k, from: 'phecda-server' }
        })
        .concat(opts.imports || []),
    })
  }
  catch (e) {
    return false
  }
}

export function handleClassTypes(input) {
  return input.replace(/const\s+(\w+)\s*:\s*typeof\s+import\(['"](.+)['"]\)\['(\w+)'\]/g, (_, n, p, e) => {
    if (isAbsolute(p))
      return `${_}\n  type ${n} = InstanceType<typeof import('${p}')['${e}']>`

    return _
  })
}
