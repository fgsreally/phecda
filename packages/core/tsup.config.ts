import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['src/index.ts', 'src/preset/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  globalName: 'Phecda',
  dts: true,
  splitting: false,
  shims: false,
}
