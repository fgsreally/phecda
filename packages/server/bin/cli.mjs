#! /usr/bin/env node
import { fork } from 'child_process'
import { createRequire } from 'module'
import pc from 'picocolors'
import cac from 'cac'
import fse from 'fs-extra'
import { log as psLog } from '../dist/index.mjs'

const log = (...args) => {
  if (process.env.PS_BAN_CLI_LOG)
    return

  psLog(...args)
}

const cli = cac('phecda').option('-c,--config <config>', 'config file', {
  default: 'ps.json',
})

const require = createRequire(import.meta.url)
let child

let closePromise
const nodeVersion = parseFloat(process.version.slice(1))

if (nodeVersion < 18.19) {
  log(
    `Nodejs version less than 18.19(current is ${nodeVersion}) can't support hmr`,
    'yellow',
  )
}

function startChild(file, args) {
  child = globalThis.PS_CREATE_CHILD?.() || fork(file, {
    env: { ...process.env },
    stdio: 'inherit',
    execArgv: [
      nodeVersion < 18.19
        ? '--loader=phecda-server/register/loader.mjs'
        : '--import=phecda-server/register',
      ...args,
    ],
  })

  closePromise = new Promise((resolve) => {
    child.once('exit', (code) => {
      if (code === 4171)
        startChild(file, args)

      if (code === 4172)
        return process.exit()

      child = undefined

      resolve()
    })
  })
}

function exit() {
  log('process exit')

  if (child) {
    child.kill()
    process.exit(0)
  }
  else {
    process.exit(0)
  }
}
process.on('SIGINT', () => {
  process.exit()
})

cli
  .command('init [root]', 'init config file')
  .allowUnknownOptions()
  .option('-t,--tsconfig <tsconfig>', 'init tsconfig file', {
    default: 'tsconfig.json',
  })
  .action(async (root, options) => {
    if (root)
      process.chdir(root)

    let hasUnimport

    try {
      await import('unimport')
      hasUnimport = true
    }

    catch (e) {
      hasUnimport = false
    }

    const tsconfigPath = options.tsconfig
    const psconfigPath = process.env.PS_CONFIG_FILE || options.config

    if (!fse.existsSync(tsconfigPath)) {
      log(`create ${tsconfigPath}`)

      await fse.outputJSON(
        tsconfigPath,
        {
          compilerOptions: {
            target: 'esnext',
            useDefineForClassFields: false,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            module: 'esnext',
            lib: ['esnext', 'DOM'],
            strictPropertyInitialization: false,
            moduleResolution: 'bundler',
            strict: true,
            resolveJsonModule: true,
            esModuleInterop: true,
            noEmit: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noImplicitReturns: true,
            skipLibCheck: true,
          },
          include: ['.', hasUnimport ? (process.env.PS_DTS_PATH || 'ps.d.ts') : undefined],
        },

      )
    }

    if (!fse.existsSync(psconfigPath)) {
      log(`create ${psconfigPath}`)

      await fse.outputJSON(psconfigPath, {
        $schema: './node_modules/phecda-server/assets/schema.json',
        resolve: [
          {
            source: 'controller',
            importer: 'http',
            path: '.ps/http.js',
          },
          {
            source: 'rpc',
            importer: 'client',
            path: '.ps/rpc.js',
          },
        ],
        unimport: hasUnimport && {
          dirs: [
            '.',
          ],
          dirsScanOptions: {
            filePatterns: [
              '*.{service,controller,module,rpc,solo,guard,extension,pipe,filter,addon}.ts',
            ],
          },
        },
        virtualFile: {},
        moduleFile: [],
      })
    }

    log('init finish')
  })

cli
  .command('<file> [root]', 'run file')
  .alias('run')
  .allowUnknownOptions()
  .option('-p,--prod [prod]', 'prod mode', {
    default: false,
  })
  .action((file, root, options) => {
    if (root)
      process.chdir(root)

    if (options.prod)
      process.env.NODE_ENV = 'production'
    else
      process.env.NODE_ENV = 'development'

    process.env.PS_CONFIG_FILE = process.env.PS_CONFIG_FILE || options.config

    log('process start!')

    startChild(file, options['--'])
    console.log(`${pc.green('->')} press ${pc.green('e')} to exit`)
    console.log(`${pc.green('->')} press ${pc.green('r')} to relaunch`)
    console.log(`${pc.green('->')} press ${pc.green('c')} to clear terminal`)

    process.stdin.on('data', async (data) => {
      const input = data.toString().trim().toLocaleLowerCase()
      if (input === 'r') {
        if (child) {
          await child.kill()
          if (closePromise)
            await closePromise
          log('relaunch...')
          startChild(file, options['--'])
        }
        else {
          log('relaunch...')

          startChild(file, options['--'])
        }
      }
      if (input === 'e')
        exit()

      if (input === 'c')
        console.clear()
    })
  })

cli
  .command('generate <file> [root]', 'generate code(mainly for ci)')
  .allowUnknownOptions()
  .action((file, root, options) => {
    if (root)
      process.chdir(root)
    process.env.PS_GENERATE = 'true'
    process.env.PS_CONFIG_FILE = process.env.PS_CONFIG_FILE || options.config
    startChild(file, options['--'])
  })

cli.help()
cli.version(require('../package.json').version)

cli.parse()
