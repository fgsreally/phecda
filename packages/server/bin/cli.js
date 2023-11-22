const { exec } = require('child_process')
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

  child.on('exit', (code) => {
    if (code === 3) {
      log('relunch...')
      return startChild()
    }

    process.exit(0)
  })
}

process.on('SIGINT', () => {
  child.kill('SIGINT')
})

function log(msg, color = 'green') {
  const date = new Date()
  console.log(`${pc.gray(`${date.getHours()} ${date.getMinutes()} ${date.getSeconds()}`)} ${pc.magenta('[phecda-server]')} ${pc[color](msg)}`)
}

startChild()
