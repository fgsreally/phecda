export function Shallow(module: any) {
  init(module.prototype)
  module.prototype.__SHALLOW__ = true
}
