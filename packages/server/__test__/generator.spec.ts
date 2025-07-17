import { describe, expect, it } from 'vitest'
import { ApiDoc, Body, Controller, Factory, Get, HTTPGenerator, OpenAPIGenerator, Query, RPCGenerator } from '../src'

describe('generater', () => {
  it('generate http request code', async () => {
    @Controller('/base')
    class A {
      @Get('/test')
      test(@Query('id') id: string, @Body('name') name: string) {
        return id + name
      }
    }
    const { meta } = await Factory([A])
    const code = new HTTPGenerator('').generateCode(meta)
    expect(code).toMatchSnapshot()
  })

  it('generate RPC request', async () => {
    @Controller('/base')
    class A {
      @Get('/test')
      test(@Body() id: string, @Body() name: string) {
        return id + name
      }
    }
    const { meta } = await Factory([A])
    const code = new RPCGenerator('').generateCode(meta)
    expect(code).toMatchSnapshot()
  })

  it('generate openapi', async () => {
    @Controller('/base')
    class A {
      @Get('/test')
      @ApiDoc({
        summary: '测试接口',
        description: '这是一个测试接口，接收 id 查询参数和 name 请求体参数',
        // 查询参数配置
        parameters: [
          {
            name: 'id',
            in: 'query',
            description: '用户ID',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        // 请求体配置
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    description: '用户名称',
                  },
                },
              },
            },
          },
        },
        // 响应配置
        responses: {
          200: {
            description: '成功返回结果',
            content: {
              'application/json': {
                schema: {
                  type: 'string',
                  description: 'id和name的组合字符串',
                },
              },
            },
          },
          400: {
            description: '请求参数错误',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      description: '错误信息',
                    },
                  },
                },
              },
            },
          },
        },
      })
      test(@Query('id') id: string, @Body('name') name: string) {
        return id + name
      }
    }
    const { meta } = await Factory([A])
    const code = new OpenAPIGenerator('').generateCode(meta)
    expect(code).toMatchSnapshot()
  })
})
