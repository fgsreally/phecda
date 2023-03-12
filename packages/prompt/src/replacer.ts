export function replacePromptStr(str: string) {
  return str.replace(/<<(.*)>>/, (_, js) => {
    return `prompt.history('${js}')`
  })
}
