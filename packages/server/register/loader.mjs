import { fileURLToPath, pathToFileURL } from 'url'
import { writeFile } from 'fs/promises'
import { extname, isAbsolute, relative, resolve as resolvePath } from 'path'
import ts from 'typescript'
import chokidar from 'chokidar'
import { PS_FILE_RE, log } from '../dist/index.mjs'
import { compile, genUnImportRet, handleClassTypes } from './utils.mjs'
let port

const isLowVersion = parseFloat(process.version.slice(1)) < 18.18
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

let unimportRet

const dtsPath = 'ps.d.ts'

if (isLowVersion)
  await initialize()

let httpCodeFileUrl
let rpcCodeFileUrl

export async function initialize(data) {
  if (data)
    port = data.port

  if (process.env.PS_UNIMPORT_BAN)
    return

  if (process.env.PS_HTTP_CODE)
    httpCodeFileUrl = pathToFileURL(resolvePath(process.cwd(), process.env.PS_HTTP_CODE))

  if (process.env.PS_RPC_CODE)
    rpcCodeFileUrl = pathToFileURL(resolvePath(process.cwd(), process.env.PS_RPC_CODE))

  unimportRet = await genUnImportRet()

  if (unimportRet) {
    log('auto import...')
    writeFile(dtsPath, handleClassTypes(await unimportRet.generateTypeDeclarations()))
  }
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
    const url = addUrlToGraph(
      pathToFileURL(resolvedModule.resolvedFileName).href,
      context.parentURL.split('?')[0],
    )

    if (rpcCodeFileUrl && /\.client\.ts$/.test(context.parentURL) && /\.rpc\.ts$/.test(resolvedModule.resolvedFileName)) {
      return {
        format: 'mjs',
        url: rpcCodeFileUrl,
        shortCircuit: true,
      }
    }

    if (httpCodeFileUrl && /\.http\.ts$/.test(context.parentURL) && /\.controller\.ts$/.test(resolvedModule.resolvedFileName)) {
      return {
        format: 'mjs',
        url: httpCodeFileUrl,
        shortCircuit: true,
      }
    }

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
    && !isLowVersion
  ) {
    watchFiles.add(url)
    // watch(
    //   fileURLToPath(url),
    //   debounce((type) => {
    //     if (type === 'change') {
    //       try {
    //         const files = [...findTopScope(url, Date.now())].reverse()

    //         port.postMessage(
    //           JSON.stringify({
    //             type: 'change',
    //             files,
    //           }),
    //         )
    //       }
    //       catch (e) {
    //         port.postMessage(
    //           JSON.stringify({
    //             type: 'relaunch',
    //           }),
    //         )
    //       }
    //     }
    //   }),
    // )
    chokidar.watch(fileURLToPath(url), { persistent: true }).on(
      'change',
      debounce(() => {
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
          port.postMessage(
            JSON.stringify({
              type: 'relaunch',
            }),
          )
        }
      }),
    )
  }
  // resolveModuleName failed
  // I don't know why it failed
  if (!context.format && url.endsWith('.ts'))
    context.format = 'ts'

  if (context.format === 'ts') {
    const { source } = await nextLoad(url, context)

    const code
      = typeof source === 'string' ? source : Buffer.from(source).toString()
    const compiled = await compile(code, url)
    if (unimportRet) {
      const { injectImports } = unimportRet
      return {
        format: 'module',
        source: (await injectImports(compiled)).code,
        shortCircuit: true,
      }
    }
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
  if (isModuleFileUrl(url)) {
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

export function isModuleFileUrl(url) {
  return PS_FILE_RE.test(url)
}
