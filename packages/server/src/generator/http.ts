import { joinUrl } from '../helper'
import type { ControllerMetaData, Meta } from '../meta'
import { Generator } from './utils'

export class HTTPGenerator extends Generator {
  name = 'HTTP'
  classMap: Record<string, { [key: string]: string }> = {}

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

  addMethod(args: ControllerMetaData) {
    const {
      http, name, method, params, tag,
    } = args
    if (!http?.method)
      return
    const url = joinUrl(http.prefix, http.route).replace(/\/\:([^\/]*)/g, (_, js) => `/{{${js}}}`)
    if (!this.classMap[name])
      this.classMap[name] = {}
    this.classMap[name][method] = `
    ${method}(...args){
  let url="${url}"  
const ret={tag:"${tag as string}",method:"${method}",body:{},headers:{},query:{},params:{}}
${params.reduce((p, c, i) => `${p}ret.${c.type}${c.key ? `['${c.key}']` : ''}=args[${i}]\n${c.type === 'params' ? `url=url.replace('{{${c.key}}}',args[${i}])` : ''}\n`, '')}
ret.http={method:"${http.method}",url}
return ret
    }
    `
  }

  generateCode(meta: Meta[]): string {
    meta.forEach(({ data }) => {
      if (data.controller === 'http')
        this.addMethod(data as ControllerMetaData)
    })
    return this.getContent()
  }
}
