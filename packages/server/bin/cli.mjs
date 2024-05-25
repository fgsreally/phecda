#! /usr/bin/env node
import { fork } from 'child_process'
import fs from 'fs'
import { createRequire } from 'module'
import pc from 'picocolors'
import cac from 'cac'
import { log } from '../dist/index.mjs'
const cli = cac('phecda')
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

cli.command('init', 'init config file').action(() => {
  log('init tsconfig.json')

  fs.writeFileSync(
    'tsconfig.json',
    `{
    "compilerOptions": {
      "target": "esnext",
      "useDefineForClassFields": false,
      "experimentalDecorators": true,
      "emitDecoratorMetadata": true,
      "module": "esnext",
      "lib": ["esnext", "DOM"],
      "strictPropertyInitialization": false,
      "moduleResolution": "Node",
      "strict": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "esModuleInterop": true,
      "noEmit": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noImplicitReturns": true,
      "skipLibCheck": true
    },
    "include": ["src","./ps.d.ts"]
  }
  `,
  )

  log('init ps.json')

  fs.writeFileSync(
    'ps.json',
   `{
    "$schema": "node_modules/phecda-server/bin/schema.json",
    "resolve": [
      {
        "source": "controller",
        "importer": "http",
        "path": "http.ts"
      },
      {
        "source": "rpc",
        "importer": "client",
        "path": "rpc.ts"
      }
    ],
    "unimport": {
      "dirs": ["./src/*"],
      "dirsScanOptions":{
          "filePatterns":["*.{service,controller,module}.ts"]
      },
      "dtsPath": "./ps.d.ts"
    },
    "moduleFile": []
  }
  `,
  )
})

cli
  .command('[file]', 'run file')
  .alias('run')
  .option('-c, --config', 'config file', {
    default: './ps.json',
  })
  .action((file, options) => {
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
  .command('generate [file]', 'generate code(mainly for ci)')
  .option('-c, --config', 'config file', {
    default: './ps.json',
  })
  .action((file, options) => {
    process.env.PS_GENERATE = 'true'
    process.env.PS_CONFIG_FILE = options.config
    startChild(file, options['--'])
  })
// if (cmd[0] === 'init') {

// }
// else if (cmd[0] === 'code') {
//   process.env.PS_GENERATE = 'true'
//   cmd.splice(0, 1)
//   startChild(file,options['--'])
// }
// else {

// }

cli.help()
cli.version(require('../package.json').version)

cli.parse()