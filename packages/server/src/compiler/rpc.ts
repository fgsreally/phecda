import type { MetaData } from '../meta'

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

  addMethod(args: MetaData) {
    const {
      rpc, name, method, tag,
    } = args
    if (!rpc || !rpc.type)
      return
    if (!this.classMap[name])
      this.classMap[name] = {}
    this.classMap[name][method] = `
    ${method}(){
      return {tag:'${tag as string}',isEvent:${!!rpc.isEvent},rpc:[${rpc.type.reduce((p, c) => {
        return `${p}"${c}",`
      }, '')}]}

    }
    `
  }
}

export function generateRPCCode(meta: MetaData[]) {
  const compiler = new Compiler()

  for (const i of meta)
    compiler.addMethod(i)
  return compiler.getContent()
}
