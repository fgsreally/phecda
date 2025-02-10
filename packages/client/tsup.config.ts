import type { Options } from 'tsup'
import pkg from './package.json'

export const tsup: Options = {
  entry: ['src/index.ts',
    'src/unplugin.ts',
    'src/http/index.ts', 'src/rpc/index.ts',
    'src/http/axios.ts',
    'src/http/alova.ts',
    'src/rpc/bullmq.ts',
    'src/rpc/electron.ts',
    'src/rpc/kafka.ts',
    'src/rpc/nats.ts',
    'src/rpc/rabbitmq.ts',
    'src/rpc/redis.ts',
    'src/rpc/ws.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  shims: false,
  sourcemap: !process.env.CI,
  external: Object.keys(pkg.devDependencies),
}
