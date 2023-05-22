import type { ServerMeta } from './types'

export class Pcompiler {
  classMap: Record<string, { [key: string]: string }> = {}
  name: string
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

  createRequest() {
    let content = 'import {useC} from \'phecda-server\'\n'
    for (const name in this.classMap)
      content += `export const {${Object.keys(this.classMap[name]).join(',')}}=useC(${name})\n`
    return content
  }

  addMethod(args: ServerMeta) {
    const {
      route: {
        route = '/',
        type = 'get',
      } = {}, name, method, params, tag,
    } = args
    const url = route.replace(/\/\:([^\/]*)/g, '')
    this.name = name
    if (!this.classMap[name])
      this.classMap[name] = {}
    this.classMap[name][method] = `
    ${method}(${genParams(params)}){
const ret={tag:"${tag}-${method}",body:{},query:{},params:{},realParam:'',method:"${type}",url:"${url}"}
${params.filter(item => item.key).reduce((p, c, i) => `${p}ret.${c.type}.${c.key}=arg${i}\n${c.type === 'params' ? `ret.realParam+='/'+arg${i}\n` : ''}`, '')}
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
