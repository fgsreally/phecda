/* eslint-disable no-new-func */
import prompt from 'prompt'
import fetch from 'node-fetch'
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

//
// Start the prompt
//

async function getRemoteConfig(url: string) {
  const schema = await fetch(url)
  const { data } = await schema.json() as { data: { [key: string]: any } }
  return data
}

export async function createPrompt(data: { [key: string]: any }) {
  prompt.start()
  fromJsonToData(data)
  return prompt.get({ properties: data })
}

export async function createRemotePrompt(url: string) {
  return await createPrompt(await getRemoteConfig(url))
}

export { prompt }
