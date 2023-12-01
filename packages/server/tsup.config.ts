import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['src/index.ts', 'src/test.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  shims: false,
  sourcemap: true,
}
