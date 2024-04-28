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

  // createRequest() {
  //     let content = 'import {useC} from \'phecda-server\'\n'
  //     for (const name in this.classMap)
  //         content += `export const {${Object.keys(this.classMap[name]).join(',')}}=useC(${name})\n`
  //     return content
  // }

  addMethod(args: MetaData) {
    const {
      http, name, func, params, tag,
    } = args
    if (!http)
      return
    const url = http.route.replace(/\/\:([^\/]*)/g, (_, js) => `/{{${js}}}`)
    if (!this.classMap[name])
      this.classMap[name] = {}
    this.classMap[name][func] = `
    ${func}(...args){
const ret={tag:"${tag as string}",func:"${func}",body:{},headers:{},query:{},params:{},method:"${http.type}",url:"${url}",args}

${params.reduce((p, c, i) => `${p}ret.${c.type}${c.key ? `['${c.key}']` : ''}=args[${i}]\n${c.type === 'params' ? `ret.url=ret.url.replace('{{${c.key}}}',args[${i}])` : ''}\n`, '')}
return ret
    }
    `
  }
}

export function generateHTTPCode(meta: MetaData[]) {
  const compiler = new Compiler()

  for (const i of meta)
    compiler.addMethod(i)
  return compiler.getContent()
}
