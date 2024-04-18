import type { RouteShorthandOptions } from 'fastify'
import { Define } from '../../'
export * from './bind'
export function Fastify(opts: RouteShorthandOptions) {
  return Define('fastify', opts)
}
