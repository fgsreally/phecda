import type { ServerMeta } from './types'

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

  addMethod(args: ServerMeta) {
    const {
      route: {
        route = '/',
        type = 'get',
      } = {}, name, method, params, tag,
    } = args
    const url = route.replace(/\/\:([^\/]*)/g, '')
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

//   addMqMethod(className: string, methodName: string, tag: string, exchange = '', routeKey = '', queue = '', params: { type: string; key: string; index: number }[] = []) {
//     if (!this.classMap[className])
//       this.classMap[className] = {}
//     this.classMap[className][methodName] = `
//     ${methodName}(${genParams(params)}){
// const ret={tag:"${tag}-${methodName}",exchange:"${exchange}",routeKey:"${routeKey}",queue:"${queue}",args:{}}
// ${params.reduce((p, c, i) => `${p}ret.args.${c.key}=arg${i}\n`, '')}
// return ret
//     }
//     `
//   }
}

function genParams(decorators: any[]) {
  return decorators.map((_, i) => {
    return `${`arg${i}`}`
  }).join(',')
}
