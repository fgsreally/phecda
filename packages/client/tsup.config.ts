import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['src/index.ts', 'src/unplugin.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  shims: false,
  sourcemap: !process.env.CI,
}
