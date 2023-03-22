import { describe, expect, it } from 'vitest'
import { createTableData, updateItemTypeMeta } from '../src/components/form'

describe('test', () => {
  it('test', () => {
    const test = [{
      name: 'nestedOptional',
      global: false,
      description: 'optional nested object',
      tags: [],
      required: false,
      type: 'MyNestedProps | MyIgnoredNestedProps | undefined',
      schema: {
        kind: 'enum',
        type: 'MyNestedProps | MyIgnoredNestedProps | undefined',
        schema: [
          'undefined',
          {
            kind: 'object',
            type: 'MyNestedProps',
            schema: {
              nestedProp: {
                name: 'nestedProp',
                global: false,
                description: 'nested prop documentation',
                tags: [],
                required: true,
                type: 'string',
                schema: 'string',
              },
            },
          },
        ],
      },
    }, {
      name: 'foo',
      global: false,
      description: 'string foo',
      tags: [
        { name: 'default', text: '"rounded"' },
        { name: 'since', text: 'v1.0.0' },
        { name: 'see', text: 'https://vuejs.org/' },
        {
          name: 'example',
          text: '```vue\n<template>\n  <component foo="straight" />\n</template>\n```',
        },
      ],
      required: true,
      type: 'string',
      schema: 'string',
    },
    {
      name: 'nested',
      global: false,
      description: 'required nested object',
      tags: [],
      required: true,
      type: 'MyNestedProps',
      schema: {
        kind: 'object',
        type: 'MyNestedProps',
        schema: {
          nestedProp: {
            name: 'nestedProp',
            global: false,
            description: 'nested prop documentation',
            tags: [],
            required: true,
            type: 'string',
            schema: 'string',
          },
        },
      },
    }]
    const data = createTableData(test)
    test[0].currentType
    updateItemTypeMeta(test[0])
  })
})
