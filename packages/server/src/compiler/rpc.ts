import type { P } from '../types'

class Compiler {
  classMap: Record<string, { [key: string]: string }> = {}
  constructor() { }

  getContent() {
    let content = ''

    for (const name in this.classMap) {
      content += `
        export class ${name}{
            ${Object.values(this.classMap[name]).reduce((p, c) => p + c)}
            }`
    }
    return content
  }

  addMethod(args: P.Meta) {
    const {
      rpc, name, method, tag,
    } = args
    if (!rpc || !rpc.type)
      return
    if (!this.classMap[name])
      this.classMap[name] = {}
    this.classMap[name][method] = `
    ${method}(){
      return {tag:'${tag}-${method}',isEvent:${!!rpc.isEvent},rpc:[${rpc.type.reduce((p, c) => {
        return `${p}"${c}",`
      }, '')}]}

    }
    `
  }
}

export function generateRPCCode(meta: P.Meta[]) {
  const compiler = new Compiler()

  for (const i of meta)
    compiler.addMethod(i)
  return compiler.getContent()
}
