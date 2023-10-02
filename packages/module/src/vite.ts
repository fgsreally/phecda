export default function (reg = /\.module\.ts$/) {
  return {
    name: 'phecda-module-hmr',
    enforce: 'pre',
    apply: 'serve',
    transform(code: string, id: string) {
      if (reg.test(id)) {
        return code += `\nif (import.meta.hot)
    import.meta.hot.accept(__PHECDA_MODULE_UPDATE__)`
      }
    },
  }
}
