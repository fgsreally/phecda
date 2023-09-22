<script setup lang="ts">
import { ref } from 'vue'
// import Form from "@vformore/component";
import { Form, FormItem } from '@arco-design/web-vue'
import * as Arco from '@arco-design/web-vue'

import { Rule, createForm, createFormData, getArcoRules } from 'phecda-vue'

class Pension {
  @Rule(
    async (num: number) => {
      return num > 55
    },
    '需要大于55',
    { required: true, trigger: 'blur' },
  )
  age: number

  @Rule((num: number) => {
    return num > 5000
  }, '似乎太低了')
  money: number
}
const rules = getArcoRules(new Pension())

const CustomForm = createForm(Arco as any, Form, FormItem)
const ruleFormRef = ref<any>()
const { config, data } = createFormData({
  age: {
    _component: 'InputNumber',
    _default: 40,
    _formItem: { 'label': '年龄', 'field': 'age', 'validate-trigger': 'blur' },
    label: '年龄',
  },
  money: {
    _active: '{{age>40}}',
    _component: 'Select',
    _formItem: { 'label': '退休金', 'field': 'money', 'validate-trigger': 'blur' },
    _default: 3000,
    _mount: console.log,
    _unmount: console.log,
    _children: [
      { key: 'low', label: '普通', value: 3000, _component: 'Option' },
      { key: 'high', label: '高', value: 8000, _component: 'Option' },
    ],
    disabled: '{{age<55}}',
    label: '退休金',
  },
  _arco: {
    '_component': 'Button',
    'html-type': 'submit',
    '_children': [
      'submit',
    ],
  },
})
</script>

<template>
  <CustomForm
    ref="ruleFormRef"
    :config="config"
    style="display:flex;flex-wrap: wrap;width:600px;box-sizing: border-box"
    :data="data"
    :model="data"
    :rules="rules"
    label-width="120px"
  />
  {{ data }}
</template>

<style>
*{
  margin: 0;padding: 0;
}
</style>
