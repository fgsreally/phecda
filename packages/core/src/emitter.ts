import mitt from 'mitt'
import type { PhecdaEvents } from './types'

export const emitter = mitt<PhecdaEvents>()

export const emit = emitter.emit.bind(emitter)
