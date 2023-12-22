import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['src/index.ts',
    'src/test.ts',
    'src/server/express/index.ts',
    'src/server/fastify/index.ts',
    'src/server/h3/index.ts',

    'src/rpc/rabbitmq/index.ts',
    'src/rpc/redis/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  shims: false,
  sourcemap: true,
  external: ['amqplib', 'ioredis', 'express', 'fastify', 'h3', 'koa'],
}
