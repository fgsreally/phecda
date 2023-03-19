import mitt from 'mitt'
import type { PhecdaEvents } from './types'

export const emitter = mitt<PhecdaEvents>()

export const invokeAction = emitter.emit.bind(emitter)
