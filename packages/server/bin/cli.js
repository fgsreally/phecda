const { fork } = require('child_process')

const fs = require('fs')
const pc = require('picocolors')
const cmd = process.argv.slice(2)

let child

let closePromise
const nodeVersion = parseFloat(process.version.slice(1))

if (nodeVersion < 18.18) {
  log(
    `Nodejs version less than 18.18(current is ${nodeVersion}) can't support hmr`,
    'yellow',
  )
}

function startChild() {
  child = fork(cmd[0], {
    env: { NODE_ENV: 'development', ...process.env },
    stdio: 'inherit',
    execArgv: [
      nodeVersion < 18.18
        ? '--loader=phecda-server/register/loader.mjs'
        : '--import=phecda-server/register',
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
if (cmd[0] === 'init') {
  fs.writeFileSync('tsconfig.json', `{
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
  `)

  log('init tsconfig.json!')
}
else {
  startChild()
  log('process start!')
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
        startChild()
      }
      else {
        log('relaunch...')

        startChild()
      }
    }
    if (input === 'e')
      exit()
  })
}
