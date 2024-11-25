import { fileURLToPath, pathToFileURL } from 'url'
import { writeFile } from 'fs/promises'
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  relative,
  resolve as resolvePath,
} from 'path'
import { createRequire } from 'module'
import { existsSync } from 'fs'
import ts from 'typescript'
import chokidar from 'chokidar'
import { IS_DEV, log } from '../dist/index.mjs'
import { compile, genUnImportRet, handleClassTypes, slash } from './utils.mjs'

let port
let tsconfig = {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
}

const isLowVersion = parseFloat(process.version.slice(1)) < 18.19
// this part is important or not?
const EXTENSIONS = [ts.Extension.Ts, ts.Extension.Tsx, ts.Extension.Mts]

const tsconfigPath = resolvePath(process.cwd(), 'tsconfig.json')
const tsRet = ts.readConfigFile(tsconfigPath, ts.sys.readFile)

if (!tsRet.error) {
  const { error, options } = ts.parseJsonConfigFileContent(
    tsRet.config,
    ts.sys,
    dirname(tsconfigPath),
  )
  if (!error)
    tsconfig = options
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

const workdir = process.cwd()

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
  if (!config.paths)
    config.paths = {}

  if (IS_DEV) {
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
      handleClassTypes(
        await unimportRet.generateTypeDeclarations({
          resolvePath: (i) => {
            if (i.from.startsWith('.') || isAbsolute(i.from)) {
              const related = slash(
                relative(workdir, i.from).replace(/\.ts(x)?$/, ''),
              )

              return !related.startsWith('.') ? `./${related}` : related
            }
            return i.from
          },
        }),
      ),
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
    if (/^file:\/\/\//.test(specifier) && existsSync(fileURLToPath(specifier))) {
      entryUrl = specifier

      return {
        format: EXTENSIONS.some(ext => specifier.endsWith(ext))
          ? 'ts'
          : undefined,
        url: specifier,
        shortCircuit: true,
      }
    }
    else {
      // won't resolve virtual file as entry in vite
      return nextResolve(specifier)
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
  if (resolveRet.url && isAbsolute(resolveRet.url))
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

    if (IS_DEV) {
      if (isModuleFileUrl(url)) {
        port.postMessage(
          JSON.stringify({
            type: 'init',
            files: [fileURLToPath(url)],
          }),
        )
      }

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
    const compiled = (await compile(code, url)).replace(/_ts_metadata\(\"design:paramtypes\"\,/g, '_ts_metadata("design:paramtypes",()=>')// handle cycle

    if (unimportRet) {
      const { injectImports } = unimportRet
      return {
        format: 'module',
        source: (
          await injectImports(
            compiled,
            slash(url.startsWith('file://') ? fileURLToPath(url) : url),
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
      'addon',
      'filter',
      'pipe',
      'solo',
    ].includes(midName)
  )
    return true

  return config.moduleFile && config.moduleFile.includes(midName)
}
