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
      route: {
        route = '/',
        type = 'get',
      } = {}, name, method, params, tag,
    } = args
    const url = route.replace(/\/\:([^\/]*)/g, (_, js) => `/{{${js}}}`)
    if (!this.classMap[name])
      this.classMap[name] = {}
    this.classMap[name][method] = `
    ${method}(${genParams(params)}){
const ret={tag:"${tag}-${method}",body:{},headers:{},query:{},params:{},method:"${type}",url:"${url}"}
${params.reduce((p, c, i) => `${p}if(arg${i}!==undefined&&arg${i}!==null){ret.${c.type}${c.key ? `['${c.key}']` : ''}=arg${i}\n${c.type === 'params' ? `ret.url=ret.url.replace('{{${c.key}}}',arg${i})}` : '}'}\n`, '')}
return ret
    }
    `
  }
}

function genParams(decorators: any[]) {
  return decorators.map((_, i) => {
    return `${`arg${i}`}`
  }).join(',')
}

export function generateHTTPCode(meta: P.Meta[]) {
  const compiler = new Compiler()

  for (const i of meta)
    compiler.addMethod(i)
  return compiler.getContent()
}
