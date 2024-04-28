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
      rpc, name, func, tag,
    } = args
    if (!rpc)
      return
    if (!this.classMap[name])
      this.classMap[name] = {}
    this.classMap[name][func] = `
    ${func}(){
      return {tag:'${tag as string}',func:"${func}",isEvent:${!!rpc.isEvent},queue:"${rpc.queue || ''}"}

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
