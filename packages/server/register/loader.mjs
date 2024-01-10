import { fileURLToPath, pathToFileURL } from 'url'
import { watch } from 'fs'
import { extname, isAbsolute, relative } from 'path'
import ts from 'typescript'
import { compile } from './compile.mjs'
let port

// this part is important or not?
const EXTENSIONS = [ts.Extension.Ts, ts.Extension.Tsx, ts.Extension.Mts]
const tsconfig = {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
}
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
const filesRecord = new Map()
const moduleGraph = {}

let entryUrl

function addUrlToGraph(url, parent) {
  if (!(url in moduleGraph))
    moduleGraph[url] = new Set()

  moduleGraph[url].add(parent)
  return url + (filesRecord.has(url) ? `?t=${filesRecord.get(url)}` : '')
}

export const resolve = async (specifier, context, nextResolve) => {
  // entrypoint
  if (!context.parentURL) {
    entryUrl = specifier
    return {
      format: EXTENSIONS.some(ext => specifier.endsWith(ext))
        ? 'ts'
        : undefined,
      url: specifier,
      shortCircuit: true,
    }
  }
  if (/^file:\/\/\//.test(specifier) && extname(specifier) === '.ts') {
    const url = addUrlToGraph(specifier, context.parentURL.split('?')[0])

    return {
      format: 'ts',
      url,
      shortCircuit: true,
    }
  }

  if (
    context.parentURL.includes('/node_modules/phecda-server')
    && isAbsolute(specifier)
  ) {
    specifier = relative(fileURLToPath(entryUrl), specifier)
      .replace(/\.ts$/, '')
      .slice(1)
    context.parentURL = entryUrl
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
    const url = addUrlToGraph(pathToFileURL(resolvedModule.resolvedFileName).href, context.parentURL.split('?')[0])

    return {
      format: 'ts',
      url,
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

    watch(
      fileURLToPath(url),
      debounce((type) => {
        if (type === 'change') {
          try {
            const files = [...findTopScope(url, Date.now())].reverse()
            port.postMessage(
              JSON.stringify({
                type: 'change',
                files,
              }),
            )
          }
          catch (e) {
            process.exit(3)
          }
        }
      }),
    )
  }

  if (context.format === 'ts') {
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

function findTopScope(url, time, modules = new Set()) {
  filesRecord.set(url, time)
  if (
    url.endsWith('.controller.ts')
    || url.endsWith('.service.ts')
    || url.endsWith('.route.ts')
    || url.endsWith('.module.ts')
    || url.endsWith('.rpc.ts')
    || url.endsWith('.guard.ts')
    || url.endsWith('.interceptor.ts')
    || url.endsWith('.pipe.ts')
    || url.endsWith('.plugin.ts')
    || url.endsWith('.filter.ts')

  ) {
    modules.add(fileURLToPath(url))
  }
  else {
    if (!moduleGraph[url])
      throw new Error('root file update')
    for (const i of [...moduleGraph[url]]) findTopScope(i, time, modules)
  }

  return modules
}

function debounce(cb, timeout = 500) {
  let timer
  return (...args) => {
    if (timer)
      return

    timer = setTimeout(() => {
      cb(...args)
      timer = undefined
    }, timeout)
  }
}
