import { fileURLToPath, pathToFileURL } from 'url'
import { watch } from 'fs'
import ts from 'typescript'
import { compile } from './compile.mjs'
let port

// this part is important or not?
const EXTENSIONS = [ts.Extension.Ts, ts.Extension.Tsx, ts.Extension.Mts]
const tsconfig = {}
tsconfig.module = ts.ModuleKind.ESNext
const moduleResolutionCache = ts.createModuleResolutionCache(
  ts.sys.getCurrentDirectory(),
  x => x,
  tsconfig,
)
const host = {
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
}

export async function initialize(data) {
  port = data.port
}

const watchFiles = new Set()
const updateFiles = new Set()
const moduleGraph = {}

export const resolve = async (specifier, context, nextResolve) => {
  // entrypoint
  if (!context.parentURL) {
    return {
      format: EXTENSIONS.some(ext => specifier.endsWith(ext))
        ? 'ts'
        : undefined,
      url: specifier,
      shortCircuit: true,
    }
  }
  // import/require from external library
  if (context.parentURL.includes('/node_modules/'))
    return nextResolve(specifier)

  const { resolvedModule } = ts.resolveModuleName(
    specifier,
    fileURLToPath(context.parentURL),
    tsconfig,
    host,
    moduleResolutionCache,
  )
  // import from local project to local project TS file
  if (
    resolvedModule
    && !resolvedModule.resolvedFileName.includes('/node_modules/')
    && EXTENSIONS.includes(resolvedModule.extension)
  ) {
    const url = pathToFileURL(resolvedModule.resolvedFileName).href

    if (!(url in moduleGraph))
      moduleGraph[url] = new Set()

    moduleGraph[url].add(context.parentURL)

    return {
      format: 'ts',
      url: url + (updateFiles.has(url) ? `?t=${Date.now()}` : ''),
      shortCircuit: true,
    }
  }

  return nextResolve(specifier)
}

export const load = async (url, context, nextLoad) => {
  url = url.split('?')[0]
  if (
    !url.includes('/node_modules/')
    && url.startsWith('file://')
    && !watchFiles.has(url)
  ) {
    watchFiles.add(url)

    watch(fileURLToPath(url), (type) => {
      if (type === 'change' && !updateFiles.has(url))

        port.postMessage(JSON.stringify([...findTopScope(url)]))
    })
  }

  if (context.format === 'ts') {
    updateFiles.delete(url)

    const { source } = await nextLoad(url, context)
    const code
      = typeof source === 'string' ? source : Buffer.from(source).toString()
    const compiled = await compile(code, url)

    return {
      format: 'module',
      source: compiled,
      shortCircuit: true,
    }
  }
  else {
    return nextLoad(url, context)
  }
}

export function findTopScope(url, modules = new Set()) {
  updateFiles.add(url)
  if (
    url.endsWith('.controller.ts')
    || url.endsWith('.service.ts')
    || url.endsWith('.route.ts')
    || url.endsWith('.module.ts')
  ) {
    modules.add(fileURLToPath(url))
  }
  else {
    if (!moduleGraph[url])
      return modules

    for (const i of [...moduleGraph[url]]) findTopScope(i, modules)
  }

  return modules
}
