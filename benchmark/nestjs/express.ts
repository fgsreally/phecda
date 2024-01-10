/* eslint-disable no-console */
/* eslint-disable import/first */
console.time('cold-start')

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false })
  await app.listen(process.env.PORT!, () => {
    console.timeEnd('cold-start')
    console.log(`Nestjs started on port ${process.env.PORT}`)
  })
}
bootstrap()
