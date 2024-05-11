import type { Options } from 'tsup'
import pkg from './package.json'
export const tsup: Options = {
  entry: [
    'src/index.ts',
    'src/test.ts',
    'src/server/express/index.ts',
    'src/server/koa/index.ts',
    'src/server/fastify/index.ts',
    'src/server/h3/index.ts',
    'src/server/hyper-express/index.ts',
    'src/server/hono/index.ts',
    'src/server/elysia/index.ts',

    'src/rpc/rabbitmq/index.ts',
    'src/rpc/kafka/index.ts',
    'src/rpc/bullmq/index.ts',
    'src/rpc/nats/index.ts',
    'src/rpc/redis/index.ts',

  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: !process.env.CI,
  external: Object.keys(pkg.devDependencies),
}
