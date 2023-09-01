<script setup lang="ts">
import { reactive, ref } from 'vue'
// import Form from "@vformore/component";
import { Rule } from 'phecda-vue'

import * as Naive from 'naive-ui'
import { NButton, NForm, NFormItem } from 'naive-ui'
import { ElMessage } from 'element-plus'

import { createForm, createFormData, getNaiveUIRules } from 'phecda-vue'

class Pension {
  @Rule(
    (num: number) => {
      return num > 55
    },
    '需要大于55',
    { trigger: 'input' },
  )
  age: number

  @Rule((num: number) => {
    return num > 5000
  }, '似乎太低了')
  money: number
}
const CustomForm = createForm(Naive, NForm, NFormItem, {
  modelKey: 'value',
})

const ruleFormRef = ref<any>()
const { config, data } = createFormData({
  age: {
    _component: 'NInputNumber',
    _default: 40,
    _formItem: { label: '年龄', path: 'age' },
    label: '年龄',
  },
  money: {
    _component: 'NSelect',
    _formItem: { label: '退休金', path: 'money' },
    _default: 3000,
    options: [
      { key: 'low', label: '普通', value: 3000 },
      { key: 'high', label: '高', value: 8000 },
    ],
    disabled: '{{age<=55}}',
    label: '退休金',
  },
})

const rules = getNaiveUIRules(new Pension())
const submitForm = (formEl: any) => {
  if (!formEl)
    return

  formEl.$.exposed?.validate((errors: any) => {
    if (errors)
      ElMessage.error('fail')
    else
      ElMessage.success('success')
  })
}
</script>

<template>
  <CustomForm
    ref="ruleFormRef"
    :data="data"
    :config="config"
    :model="data"
    label-width="120px"
    :rules="rules"
  />

  <NButton type="primary" @click="submitForm(ruleFormRef)">
    Submit
  </NButton>
  {{ data }}
</template>
