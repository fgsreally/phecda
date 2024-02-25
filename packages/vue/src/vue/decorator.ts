export function Isolate() {
  return (target: any) => {
    target.prototype.__ISOLATE__ = true
  }
}
