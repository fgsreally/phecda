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

  // createRequest() {
  //     let content = 'import {useC} from \'phecda-server\'\n'
  //     for (const name in this.classMap)
  //         content += `export const {${Object.keys(this.classMap[name]).join(',')}}=useC(${name})\n`
  //     return content
  // }

  addMethod(args: P.Meta) {
    const {
      rpc, name, method, tag,
    } = args
    if (!rpc)
      return
    if (!this.classMap[name])
      this.classMap[name] = {}
    this.classMap[name][method] = `
    ${method}(){
      return {tag:'${tag}-${method}',rpc:[${rpc.reduce((p, c) => {
        return `${p}"${c}",`
      })}]}

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
