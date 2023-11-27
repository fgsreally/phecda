const { exec } = require('child_process')
const pc = require('picocolors')
const kill = require('tree-kill')
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
  if (child) {
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
})
