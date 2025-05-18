import { setMeta } from 'phecda-core'

// OpenAPI 基础类型定义
interface OpenAPIBaseConfig {
  summary?: string
  description?: string
  tags?: string[]
  deprecated?: boolean
}

// 请求参数配置
interface OpenAPIParameterConfig {
  name: string
  in: 'query' | 'header' | 'path' | 'cookie'
  description?: string
  required?: boolean
  schema: {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array'
    items?: any
    properties?: Record<string, any>
  }
}

// 响应配置
interface OpenAPIResponseConfig {
  description: string
  content?: {
    [key: string]: {
      schema: {
        type: string
        properties?: Record<string, any>
        items?: any
        description?: string
      }
    }
  }
}

// 完整的 OpenAPI 配置接口
export interface OpenAPIConfig extends OpenAPIBaseConfig {
  parameters?: OpenAPIParameterConfig[]
  requestBody?: {
    required?: boolean
    content: {
      [key: string]: {
        schema: {
          type: string
          properties?: Record<string, any>
          items?: any
          [key: string]: any // 其他属性
        }
      }
    }
  }
  responses?: {
    [statusCode: string]: OpenAPIResponseConfig
  }
}
/**
 * OpenAPI 装饰器函数
 * @param config OpenAPI/Swagger 配置
 */
export function ApiDoc(config: OpenAPIConfig) {
  return function (target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
    setMeta(target, propertyKey, undefined, {
      openapi: config,
    })
  }
}
