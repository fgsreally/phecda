import type { RequestType } from './types'

export class Pcompiler {
  content = ''
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

  addMethod(className: string, methodName: string, route = '', requestType: RequestType | '' = '', params: { type: string; key: string; index: number }[] = []) {
    const url = route.replace(/\/\:([^\/]*)/g, '')
    if (!this.classMap[className])
      this.classMap[className] = {}
    this.classMap[className][methodName] = `
    ${methodName}(${genParams(params)}){
const ret={tag:"${className}-${methodName}",body:{},query:{},params:{},realParam:'',method:"${requestType}",url:"${url}"}
${params.reduce((p, c, i) => `${p}ret.${c.type}.${c.key}=arg${i}\n${c.type === 'params' ? `ret.realParam+='/'+arg${i}\n` : ''}`, '')}
return ret
    }
    `
  }

  addMqMethod(className: string, methodName: string, exchange = '', routeKey = '', queue = '', params: { type: string; key: string; index: number }[] = []) {
    if (!this.classMap[className])
      this.classMap[className] = {}
    this.classMap[className][methodName] = `
    ${methodName}(${genParams(params)}){
const ret={tag:"${className}-${methodName}",exchange:"${exchange}",routeKey:"${routeKey}",queue:"${queue}",args:{}}
${params.reduce((p, c, i) => `${p}ret.args.${c.key}=arg${i}\n`, '')}
return ret
    }
    `
  }
}

function genParams(decorators: any[]) {
  let index = 0
  return decorators.reduce((p) => {
    return `${`${p}arg${index++}`},`
  }, '')
}
