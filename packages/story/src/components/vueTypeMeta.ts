export const BasicType = ['string', 'undefined', 'number', 'function']

let id = 0
export function createTableData(config: any[]) {
  return config.filter(item => !item.global).map((item) => {
    return handleItemTypeMeta(item)
  })
}

function handleItemTypeMeta(item: any) {
  const kind = item.schema?.kind
  item.type = kind === 'enum' ? item.schema.schema : item.type
  item.id = id++
  item.currentType = kind === 'enum' ? item.schema.schema[0] : item.schema
  updateItemValue(item)
  if (typeof item.currentType === 'object')
    item.children = Object.values(item.currentType.schema).map(item => handleItemTypeMeta(item))
  else item.children = []

  return item
}

export function updateItemTypeMeta(item: any) {
  updateItemValue(item)

  if (typeof item.currentType === 'object')
    item.children = Object.values(item.currentType.schema).map(item => handleItemTypeMeta(item))
  else item.children = []
  return item
}

export function updateItemValue(item: any) {
  switch (item.currentType) {
    case 'string':
      item.value = ''
      break
    case 'number':
      item.value = 0
      break
    case 'null':
      item.value = null
      break
    case 'undefined':
      item.value = undefined
      break
    default:
      item.value = {}
  }
}

export function metaToPropsValue(obj: any, meta: any[]) {
  for (const item of meta) {
    obj[item.name] = item.value
    metaToPropsValue(obj[item.name], item.children)
  }
  return obj
}
