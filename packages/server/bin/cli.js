const { exec } = require('child_process')
const cmd = process.argv.slice(2)[0]
function startChild() {
  console.log(`node --import phecda-server/register ${cmd}`)
  const child = exec(`node --import phecda-server/register ${cmd}`, {
    env: process.env,
    // cwd: process.cwd(),
  })
  child.stderr.pipe(process.stderr)
  child.stdin.pipe(process.stdin)
  child.stdout.pipe(process.stdout)

  child.on('exit', (code) => {
    console.log('exit', code)
    if (code === 3)
      return startChild()
    process.exit(0)
  })
}

startChild()
