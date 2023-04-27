import mitt from 'mitt'
import type { PhecdaEmitter } from './types'

//
export const emitter: PhecdaEmitter = mitt()
