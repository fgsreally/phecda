/* eslint-disable no-new-func */
import prompt from 'prompt'
import { replacePromptStr } from './replacer'
const EXPRESS_RE = /^{{(.*)}}$/
export function fromJsonToData(jsonData: { [key: string]: any }) {
  for (const i in jsonData) {
    if (typeof jsonData[i] === 'string' && EXPRESS_RE.test(jsonData[i])) {
      const expression = replacePromptStr(jsonData[i].match(EXPRESS_RE)[1])
      const fn = new Function('v', 'prompt', `return ${expression}`)
      jsonData[i] = (v: any) => fn(v, prompt)
    }
    if (typeof jsonData[i] === 'object')
      fromJsonToData(jsonData[i])
  }
}

export async function createPrompt(data: { [key: string]: any }) {
  prompt.start()
  fromJsonToData(data)
  return prompt.get({ properties: data })
}

export { prompt }
