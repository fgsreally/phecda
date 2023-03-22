import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['src/node.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  shims: false,
}
