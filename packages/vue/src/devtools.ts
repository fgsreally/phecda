/* eslint-disable no-console */
declare const __VUE_DEVTOOLS_TOAST__: (msg: string, type?: 'normal' | 'error' | 'warn') => void

export const componentStateTypes: string[] = []

export const MUTATIONS_LAYER_ID = 'phecda-vue:mutations'
export const INSPECTOR_ID = 'phecda-vue'

export function toastMessage(
  message: string,
  type?: 'normal' | 'error' | 'warn' | undefined,
) {
  const piniaMessage = `[phecda-vue]: ${message}`

  if (typeof __VUE_DEVTOOLS_TOAST__ === 'function')
    __VUE_DEVTOOLS_TOAST__(piniaMessage, type)

  else if (type === 'error')
    console.error(piniaMessage)

  else if (type === 'warn')
    console.warn(piniaMessage)

  else
    console.log(piniaMessage)
}

export const USE_DEVTOOLS = process.env.NODE_ENV === 'development' && typeof window
