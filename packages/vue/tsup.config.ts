import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['src/index.ts'],
  define: {
    'process.env.TEST': 'false',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  shims: false,
}
