import { bind } from 'phecda-server/express'
import { Factory, HTTPGenerator, log } from 'phecda-server'
import express from 'express'
// addFilter('test', (e, tag, ctx) => {
//   const readableStream = fs.createReadStream('./index.html')
//   readableStream.pipe(ctx.response)

//   return new Promise((resolve) => {
//     readableStream.on('finish', () => {
//       resolve({ error: false })
//     })
//   })
// })

async function start() {
  const data = await Factory([TestController], {
    generators: [new HTTPGenerator()],
  })
  const router = express.Router()

  router.get('/', (_req, res) => {
    res.send('1')
  })

  const app = express()
  app.all('*', (_req, res, next) => {
    // console.log(req.headers)
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', '*')
    next()
  })

  app.use(express.json())
  bind(router, data, {
    // globalGuards: ['a'],
    // globalInterceptors: ['b'],
  })
  app.use('/base', router)

  app.listen(3008, () => {
    log('start express server...')
  })
}

start()
