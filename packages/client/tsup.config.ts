import type { Options } from 'tsup'

export const tsup: Options = {
  entry: ['src/index.ts', 'src/unplugin/unplugin.ts', 'src/unplugin/vite.ts', 'src/unplugin/esbuild.ts', 'src/unplugin/webpack.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  shims: false,
  sourcemap: !process.env.CI,
}
