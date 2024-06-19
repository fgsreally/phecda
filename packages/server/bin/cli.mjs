#! /usr/bin/env node
import { fork } from 'child_process'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

import { dirname, join, resolve } from 'path'
import pc from 'picocolors'
import cac from 'cac'
import fse from 'fs-extra'
import { log } from '../dist/index.mjs'

const cli = cac('phecda')
  .option('-c,--config <config>', 'config file', {
    default: 'ps.json',
  })

const __dirname = dirname(fileURLToPath(import.meta.url))

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
  child = fork(file, {
    env: { NODE_ENV: 'development', ...process.env },
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
      if (code === 4) {
        log('only generate code')
        process.exit(0)
      }
      if (code >= 2) {
        // for relaunch
        log('relaunch...')
        startChild(file, args)
      }
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
  .command('init [workdir]', 'init config file')
  .allowUnknownOptions()
  .option('-t,--tsconfig <tsconfig>', 'init tsconfig file', {
    default: 'tsconfig.json',
  })
  .action(async (workdir, options) => {
    const tsconfigPath = join(workdir, options.tsconfig)
    const psconfigPath = join(workdir, options.config)

    if (!fse.existsSync(tsconfigPath)) {
      log(`create ${tsconfigPath}`)

      await fse.copyFile(resolve(__dirname, '../assets/tsconfig.json'), tsconfigPath)
    }

    if (!fse.existsSync(psconfigPath)) {
      log(`create ${psconfigPath}`)

      await fse.copyFile(resolve(__dirname, '../assets/ps.json'), psconfigPath)
    }
  })

cli
  .command('<file> [workdir]', 'run file')
  .allowUnknownOptions()
  .alias('run')
  .action((file, workdir, options) => {
    if (workdir)
      process.env.PS_WORKDIR = workdir
    process.env.PS_CONFIG_FILE = options.config

    log('process start!')

    startChild(file, options['--'])
    console.log(`${pc.green('->')} press ${pc.green('e')} to exit`)
    console.log(`${pc.green('->')} press ${pc.green('r')} to relaunch`)

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
    })
  })

cli
  .command('generate <file> [workdir]', 'generate code(mainly for ci)')
  .allowUnknownOptions()
  .action((file, workdir, options) => {
    if (workdir)
      process.env.PS_WORKDIR = workdir
    process.env.PS_GENERATE = 'true'
    process.env.PS_CONFIG_FILE = options.config
    startChild(file, options['--'])
  })

cli.help()
cli.version(require('../package.json').version)

cli.parse()