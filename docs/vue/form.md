## phecda 表单


### 开始

创建一份表单包括两份工作：
1. 创建组件池
2. 创建关联关系
3. 验证数据

### 创建组件池
天权表单可以使用任何组件库实现，本质就是如同使用`element-plus`搭建一个表单，使用`form`,`formItem`,`具体的表单组件和其子组件`三个环节，用一份`json`加少许验证代替代码编写
因为天权本身不提供具体组件，所采用的组件必须自行注入组件池方便后续调用

### 创建关联

等同于创建一个 js 对象，表单中的每一项，就是对象中的一个键(需要转为英文)。这个键对应的值，也是一个对象（配置对象），其包括两部分，一部分键以`_`开头的，为内置属性，，比如`_component`就是该表单项对应的组件，其余内置属性如下

| 键名        | 描述                             |
| ----------- | -------------------------------- |
| \_default   | 默认值                           |
| \_component | 对应组件，                       |
| \_active    | 是否显示                         |
| \_formItem  | 传给`formItem`                   |
| \_children  | 对应组件的子组件，等于于配置对象 |

`_component`要选尽量符合对应项性质的组件,比如性别只能为男/女，那么这一项尽可能是有`select`性质的，如果是年龄，那么需要是`number`性质

第二部分就是表单项对应组件的`props`
比如有个组件`A`，他的`props`为`{label:string,required:boolean}`，当我希望创建一个表单，第一项为姓名，使用`A`组件，其为必填，那么就需要这样

```json
{
  "name": {
    "_component": "A",
    "label": "姓名",
    "required": true
  }
}
```

当表单中需要联动关系，比如这个表单有两项，第一项是是否购买某物品，第二项是姓名，只有当愿意购买时，姓名才为必填。那么前一个例子需改为

```json
{
  "isBuy": {
    // ..
  },

  "name": {
    "_component": "A",
    "label": "姓名",
    "required": "{{isBuy?true:false}}"
  }
}
```

需要一个用`{{}}`包裹的表达式表达关系，表达式中的项为对应的键名

举个例子，用`element-plus`实现:
创建一个表单，有年龄和退休金两项，年龄默认为 40，必填，
退休金默认为 3000，当年龄小于 40 时，不显示，退休金只有两种选择，低或高，低时对应3000，高时对应8000，当年龄小于55时，禁止填写，
```json
{
  "age": {
    "_component": "ElInputNumber",
    "_default": 40,
    "_formItem": { "label": "年龄", "prop": "age" },

    "label": "年龄"
  },
  "money": {
    "_active": "{{age>40}}",
    "_component": "ElSelect",
    "_formItem": { "label": "退休金", "prop": "money" },
    "_default": 3000,
    "_children": [
      { "key": "low", "label": "普通", "value": 3000, "_component": "ElOption" },
      { "key": "high", "label": "高", "value": 8000, "_component": "ElOption" }
    ],
    "disabled": "{{age<55}}",
    "label": "退休金"
  }
}
```
