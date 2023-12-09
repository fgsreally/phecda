import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['src/rabbitmq/index.ts', 'src/redis/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  shims: false,
  sourcemap: true,
}
