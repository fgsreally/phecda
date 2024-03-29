const { fork } = require('child_process')

const fs = require('fs')
const { posix } = require('path')
const pc = require('picocolors')
const cmd = process.argv.slice(2)

let child

let closePromise
const nodeVersion = parseFloat(process.version.slice(1))

if (nodeVersion < 18.18)
  log(`Nodejs version less than 18.18(current is ${nodeVersion}) can't support hmr`, 'yellow')

function startChild() {
  child = fork(cmd[0], {
    env: { NODE_ENV: 'development', ...process.env },
    stdio: 'inherit',
    execArgv: [
      nodeVersion < 18.18 ? '--loader=phecda-server/register/loader.mjs' : '--import=phecda-server/register',
      ...cmd.slice(1),
    ],
  })

  closePromise = new Promise((resolve) => {
    child.once('exit', (code) => {
      if (code >= 2) {
        // for relaunch
        log('relaunch...')
        startChild()
      }
      child = undefined

      resolve()
    })
  })
}

process.on('SIGINT', () => {
  process.exit()
})

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

function log(msg, color = 'green') {
  const date = new Date()
  console.log(
    `${pc.magenta('[phecda-server]')} ${pc.gray(
      `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
    )} ${pc[color](msg)}`,
  )
}

startChild()

log('process start!')
console.log(`${pc.green('->')} press ${pc.green('e')} to exit`)
console.log(`${pc.green('->')} press ${pc.green('r')} to relaunch`)
console.log(
  `${pc.green('->')} press ${pc.green(
    'c {moduleName} {dir}',
  )} to create controller`,
)
console.log(
  `${pc.green('->')} press ${pc.green(
    's {moduleName} {dir}',
  )} to create service`,
)
console.log(
  `${pc.green('->')} press ${pc.green('m {moduleName} {dir}')} to create module`,
)

process.stdin.on('data', async (data) => {
  const input = data.toString().trim().toLocaleLowerCase()
  if (input === 'r') {
    if (child) {
      await child.kill()
      if (closePromise)
        await closePromise
      log('relaunch...')
      startChild()
    }
    else {
      log('relaunch...')

      startChild()
    }
  }
  if (input === 'e')
    exit()

  if (input.startsWith('c ')) {
    let [, module, dir] = input.split(' ')
    module = toCamelCase(module)
    const path = posix.join(dir, `${module}.controller.ts`)
    fs.writeFile(
      path,
      `
    export class ${module[0].toUpperCase()}${module.slice(1)}Controller{
      
    }
    `,
      (err) => {
        if (err)
          log('writeFile filled', 'red')
        else log(`create controller at ${path}`)
      },
    )
  }
  if (input.startsWith('s ')) {
    let [, module, dir] = input.split(' ')
    module = toCamelCase(module)
    const path = posix.join(dir, `${module}.service.ts`)
    fs.writeFile(
      path,
      `
    import {Tag} from 'phecda-server'
    @Tag('${module}')
    export class ${module[0].toUpperCase()}${module.slice(1)}Service{
      
    }
    `,
      (err) => {
        if (err)
          log('writeFile filled', 'red')
        else log(`create service at ${path}`)
      },
    )
  }

  if (input.startsWith('m ')) {
    let [, module, dir] = input.split(' ')
    module = toCamelCase(module)
    const path = posix.join(dir, `${module}.module.ts`)
    fs.writeFile(
      path,
      `
    import {Tag} from 'phecda-server'
    @Tag('${module}')
    export class ${module[0].toUpperCase()}${module.slice(1)}Module{
      
    }
    `,
      (err) => {
        if (err)
          log('writeFile filled', 'red')
        else log(`create module at ${path}`)
      },
    )
  }
})

function toCamelCase(str) {
  return str.replace(/[-_]\w/g, match => match.charAt(1).toUpperCase())
}
