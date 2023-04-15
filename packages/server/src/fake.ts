export class FakeController {
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

  addMethod(className: string, methodName: string, params: { type: string; key: string; index: number }[]) {
    if (!this.classMap[className])
      this.classMap[className] = {}
    this.classMap[className][methodName] = `
    ${methodName}(${genParams(params)}){
const ret={body:{},query:{},params:{},realParam:''}
${params.reduce((p, c) => `${p}ret.${c.type}.${c.key}=arg${c.index}\n${c.type === 'params' ? `ret.realParam+='/'+arg${c.index}\n` : ''}`, '')}
return ret
    }
    `
  }
}

// function genExpression(type: string, key: string, index: number) {
//   switch (type) {
//     case 'params':
//       return `ret.params+='/'+arg${index}`
//     case 'query':
//       return `ret.query+=ret.query?"&${key}="+arg${index}:"?${key}="+arg${index}`
//     case 'body':
//       return `ret.body[${key}]=arg${index}`
//   }
// }

function genParams(decorators: any[]) {
  let index = 0
  return decorators.reduce((p) => {
    return `${`${p}arg${index++}`},`
  }, '')
}
