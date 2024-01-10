/* eslint-disable no-console */
/* eslint-disable import/first */
console.time('cold-start')

import { NestFactory } from '@nestjs/core'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { logger: false })
  await app.listen(process.env.PORT!, () => {
    console.timeEnd('cold-start')
    console.log(`Nestjs started on port ${process.env.PORT}`)
  })
}
bootstrap()
