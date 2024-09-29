import type { Options } from 'tsup'
import pkg from './package.json'
export const tsup: Options = {
  entry: [
    'src/index.ts',
    'src/test.ts',
    'src/helper.ts',
    'src/http/express/index.ts',
    'src/http/koa/index.ts',
    'src/http/fastify/index.ts',
    'src/http/h3/index.ts',
    'src/http/hyper-express/index.ts',
    'src/http/hono/index.ts',
    'src/http/elysia/index.ts',
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
