import type { Options } from 'tsup'
import pkg from './package.json'

export const tsup: Options = {
  entry: ['src/index.ts', 'src/unplugin.ts', 'src/http/index.ts', 'src/rpc/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  shims: false,
  sourcemap: !process.env.CI,
  external: Object.keys(pkg.devDependencies),
}
