import { bind } from 'phecda-server/express'
import { Factory, HTTPGenerator, log } from 'phecda-server'
import express from 'express'
import cookie from 'cookie-parser'
// import multer from 'multer'
import { TestController } from './modules/test.controller'

// const storage = multer.memoryStorage()
// const uploadSingle = multer({ storage }).single('file')
// const uploadMultiple = multer({ storage }).array('files')

async function start() {
  const data = await Factory([TestController], {
    generators: [new HTTPGenerator()],
  })
  const router = express.Router()
  const app = express()
  app.use(cookie())
  app.all('*', (_req, res, next) => {
    // console.log(req.headers)
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', '*')
    next()
  })

  // addGuard('file', async (ctx, next) => {
  //   await new Promise((resolve) => {
  //     uploadSingle(ctx.getRequest(), ctx.getResponse(), resolve)
  //   })

  //   const multerFile = ctx.getRequest().file
  //   if (multerFile) {
  //     const file = new File([multerFile.buffer], multerFile.originalname, {
  //       type: multerFile.mimetype,
  //     })

  //     ctx.file = file
  //   }
  //   next()
  // })

  // addGuard('files', async (ctx, next) => {
  //   await new Promise((resolve) => {
  //     uploadMultiple(ctx.getRequest(), ctx.getResponse(), resolve)
  //   })

  //   const multerFiles = ctx.getRequest().files
  //   if (multerFiles) {
  //     ctx.files = multerFiles.map((multerFile: any) => new File(
  //       [multerFile.buffer],
  //       multerFile.originalname,
  //       { type: multerFile.mimetype },
  //     ))
  //   }

  //   next()
  // })

  app.use(express.json())
  bind(router, data, {
    globalGuards: ['a'],
  })
  app.use('/base', router)

  app.listen(3008, () => {
    log('start express server...')
  })
}

start()
