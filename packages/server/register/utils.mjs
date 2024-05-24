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

export async function genUnImportRet(imports = []) {
  try {
    const psExports = Object.keys(await import('../dist/index.mjs'))
    const { createUnimport } = await import('unimport')

    const workspaceExports = await findWorkspaceExports()
    return createUnimport({
      imports: psExports
        .map((k) => {
          return { name: k, from: 'phecda-server' }
        })
        .concat(workspaceExports, imports),
    })
  }
  catch (e) {
    return false
  }
}

function slash(str) {
  return str.replace(/\\/g, '/')
}

async function findWorkspaceExports() {
  try {
    const { default: fg } = await import('fast-glob')
    const { scanExports } = await import('unimport')
    const result = await fg(
      '**/*.@(controller|service|module|extension|ext|guard|interceptor|plugin|filter|pipe|edge).ts',
      {
        ignore: ['node_modules'],
        absolute: true,
        cwd: process.cwd(),
        onlyFiles: true,
        followSymbolicLinks: true,
      },
    )

    const files = Array.from(new Set(result.flat())).map(slash)

    return (await Promise.all(files.map(i => scanExports(i, false))))
      .flat()
  }
  catch (e) {
    return []
  }
}

export function handleClassTypes(input) {
  return input.replace(/const\s+(\w+)\s*:\s*typeof\s+import\(['"](.+)['"]\)\['(\w+)'\]/g, (_, n, p, e) => {
    if (isAbsolute(p))
      return `${_}\n  type ${n} = InstanceType<typeof import('${p}')['${e}']>`

    return _
  })
}
