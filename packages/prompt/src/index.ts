/* eslint-disable no-new-func */
import prompt from 'prompt'
import { replacePromptStr } from './replacer'
const EXPRESS_RE = /^{{(.*)}}$/
export function fromJsonToData(jsonData: { [key: string]: any }, metadata?: any) {
  for (const i in jsonData) {
    if (typeof jsonData[i] === 'string' && EXPRESS_RE.test(jsonData[i])) {
      const expression = replacePromptStr(jsonData[i].match(EXPRESS_RE)[1])
      const fn = new Function('v', 'prompt', 'meta', `console.log(meta);return ${expression}`)
      jsonData[i] = (v: any) => fn(v, prompt, metadata)
    }
    if (typeof jsonData[i] === 'object')
      fromJsonToData(jsonData[i], metadata)
  }
}

/**
 * data is not immutable in `createPrompt`
 *
 * @param data JSON obj
 * @param metadata any data inject to prompt
 * @returns void
 */
export async function createPrompt(data: { [key: string]: any }, metadata?: any) {
  prompt.start()
  fromJsonToData(data, metadata)
  return prompt.get({ properties: data })
}

export { prompt }

// example:
// const data = {
//   proxy: {
//     description: 'Proxy url',
//   },
//   proxyCredentials: {
//     description: 'Proxy credentials',
//     ask: '{{<<proxy>>.value>0&&meta.value>10}}',
//   },
// }
