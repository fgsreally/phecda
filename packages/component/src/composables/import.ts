export async function importSfcMore(url: string) {
  const module = await import(url)
  let isDev = true
  let sfcInfo: any
  if (module.addon) {
    isDev = false
    sfcInfo = await module.addon()
  }
  else {
    sfcInfo = module
    delete sfcInfo.default
  }
  return { isDev, sfcInfo }
}
