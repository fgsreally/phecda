import { fileURLToPath, pathToFileURL } from 'url'
import { writeFile } from 'fs/promises'
import {
  basename,
  extname,
  isAbsolute,
  relative,
  resolve as resolvePath,
} from 'path'
import { createRequire } from 'module'
import ts from 'typescript'
import chokidar from 'chokidar'
import { log } from '../dist/index.mjs'
import { compile, genUnImportRet, handleClassTypes } from './utils.mjs'

let port

const isLowVersion = parseFloat(process.version.slice(1)) < 18.19
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

let config

const workdir = process.env.PS_WORKDIR || process.cwd()

const configPath = resolvePath(
  workdir,
  process.env.PS_CONFIG_FILE || 'ps.json',
)

const require = createRequire(import.meta.url)
export async function initialize(data) {
  if (data)
    port = data.port
  log('read config...')

  config = require(configPath)
  if (!config.virtualFile)
    config.virtualFile = {}

  if (!process.env.PS_HMR_BAN) {
    chokidar.watch(configPath, { persistent: true }).on('change', () => {
      port.postMessage(
        JSON.stringify({
          type: 'relaunch',
        }),
      )
    })
  }

  if (!config.unimport)
    return
  unimportRet = await genUnImportRet(config.unimport)
  if (unimportRet) {
    log('auto import...')
    await unimportRet.init()

    writeFile(
      resolvePath(workdir, config.unimport.dtsPath || dtsPath),
      handleClassTypes(await unimportRet.generateTypeDeclarations()),
    )
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

function getFileMid(file) {
  const filename = basename(file)
  const ret = filename.split('.')
  if (ret.length === 3)
    return ret[1]
  else return ''
}

export const resolve = async (specifier, context, nextResolve) => {
  // virtual file
  if (config.virtualFile[specifier]) {
    return {
      format: 'ts',
      url: specifier,
      shortCircuit: true,
    }
  }
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
  // url import
  // it seems useless
  if (/^file:\/\/\//.test(specifier) && extname(specifier) === '.ts') {
    const url = addUrlToGraph(specifier, context.parentURL.split('?')[0])
    return {
      format: 'ts',
      url,
      shortCircuit: true,
    }
  }

  // hmr import
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

  // import between loacl projects
  if (
    resolvedModule
    && !resolvedModule.resolvedFileName.includes('/node_modules/')
    && EXTENSIONS.includes(resolvedModule.extension)
  ) {
    const url = addUrlToGraph(
      pathToFileURL(resolvedModule.resolvedFileName).href,
      context.parentURL.split('?')[0],
    )

    const importerMid = getFileMid(context.parentURL)
    const sourceMid = getFileMid(resolvedModule.resolvedFileName)
    if (config.resolve && importerMid && sourceMid) {
      const resolver = config.resolve.find(
        item => item.source === sourceMid && item.importer === importerMid,
      )
      if (resolver) {
        return {
          format: 'ts',
          url: pathToFileURL(resolvePath(workdir, resolver.path)).href,
          shortCircuit: true,
        }
      }
    }

    return {
      format: 'ts',
      url,
      shortCircuit: true,
    }
  }

  const resolveRet = await nextResolve(specifier)

  // ts resolve fail in some cases
  if (isAbsolute(resolveRet.url))
    resolveRet.url = pathToFileURL(resolveRet.url).href

  return resolveRet
}
// @todo the first params may be url or path, need to distinguish

export const load = async (url, context, nextLoad) => {
  if (config.virtualFile[url]) {
    return {
      format: 'module',
      source: config.virtualFile[url],
      shortCircuit: true,
    }
  }

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

    if (!process.env.PS_HMR_BAN) {
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
        source: (
          await injectImports(
            compiled,
            (url.startsWith('file://') ? fileURLToPath(url) : url).replace(
              /\\/g,
              '/',
            ),
          )
        ).code,
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
  const midName = getFileMid(url)
  if (!midName)
    return false
  if (
    [
      'controller',
      'rpc',
      'service',
      'module',
      'extension',
      'ext',
      'guard',
      'interceptor',
      'plugin',
      'filter',
      'pipe',
      'edge',
    ].includes(midName)
  )
    return true

  return config.moduleFile && config.moduleFile.includes(midName)
}
