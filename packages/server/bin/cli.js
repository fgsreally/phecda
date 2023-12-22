const { exec } = require('child_process')

const fs = require('fs')
const { posix } = require('path')
const kill = require('tree-kill')
const pc = require('picocolors')
const cmd = process.argv.slice(2)[0]

let child
function startChild() {
  child = exec(`node --import phecda-server/register ${cmd}`, {
    env: process.env,
    // cwd: process.cwd(),
  })
  child.stderr.pipe(process.stderr)
  child.stdin.pipe(process.stdin)
  child.stdout.pipe(process.stdout)

  child.once('exit', (code) => {
    if (code >= 2) {
      log('relunch...')
      startChild()
    }
    child = undefined
  })
}

process.on('SIGINT', () => {
  process.exit()
})

function exit() {
  log('process exit')

  if (child) {
    console.log('kill')
    kill(child.pid, () => {
      process.exit(0)
    })
  }
  else {
    process.exit(0)
  }
}

function log(msg, color = 'green') {
  const date = new Date()
  console.log(`${pc.gray(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`)} ${pc.magenta('[phecda-server]')} ${pc[color](msg)}`)
}

startChild()

log('process start!')
console.log(`${pc.green('->')} press ${pc.green('e')} to exit`)
console.log(`${pc.green('->')} press ${pc.green('r')} to relunch`)
console.log(`${pc.green('->')} press ${pc.green('c {moduleName} {dir}')} to create controller`)
console.log(`${pc.green('->')} press ${pc.green('s {moduleName} {dir}')} to create service`)
console.log(`${pc.green('->')} press ${pc.green('m {moduleName} {dir}')} to create module`)

process.stdin.on('data', (data) => {
  const input = data.toString().trim().toLocaleLowerCase()
  if (input === 'r') {
    if (child) {
      kill(child.pid, () => {
        log('relunch...')
        startChild()
      })
    }
  }
  if (input === 'e')
    exit()

  if (input.startsWith('c ')) {
    let [,module, dir] = input.split(' ')
    module = toCamelCase(module)
    const path = posix.join(dir, `${module}.controller.ts`)
    fs.writeFileSync(path, `
    export class ${module[0].toUpperCase()}${module.slice(1)}Controller{
      
    }
    `)
    log(`create controller at ${path}`)
  }
  if (input.startsWith('s ')) {
    let [,module, dir] = input.split(' ')
    module = toCamelCase(module)
    const path = posix.join(dir, `${module}.service.ts`)
    fs.writeFileSync(path, `
    import {Tag} from 'phecda-server'
    @Tag('${module}')
    export class ${module[0].toUpperCase()}${module.slice(1)}Service{
      
    }
    `)
    log(`create service at ${path}`)
  }

  if (input.startsWith('m ')) {
    let [,module, dir] = input.split(' ')
    module = toCamelCase(module)
    const path = posix.join(dir, `${module}.module.ts`)
    fs.writeFileSync(path, `
    import {Tag} from 'phecda-server'
    @Tag('${module}')
    export class ${module[0].toUpperCase()}${module.slice(1)}Module{
      
    }
    `)

    log(`create module at ${path}`)
  }
})

function toCamelCase(str) {
  return str.replace(/[-_]\w/g, match => match.charAt(1).toUpperCase())
}
