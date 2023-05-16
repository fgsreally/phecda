<script setup lang="ts">
import { reactive, ref } from 'vue'
// import Form from "@vformore/component";
import { Rule } from 'phecda-vue'
import { ElButton, ElForm, ElFormItem, ElMessage, FormRules } from 'element-plus'
import * as ElPlus from 'element-plus'

import { createForm, createFormData, getElementPlusRules } from 'phecda-vue'

class Pension {
  @Rule(
    async (num: number) => {
      return num > 55
    },
    '需要大于55',
    { required: true },
  )
  age: number

  @Rule((num: number) => {
    return num > 5000
  }, '似乎太低了')
  money: number
}

const CustomForm = createForm(ElPlus as any, ElForm, ElFormItem)

const ruleFormRef = ref<any>()
const { config, data } = createFormData({
  age: {
    _component: 'ElInputNumber',
    _default: 40,
    _formItem: { label: '年龄', prop: 'age' },

    label: '年龄',
  },
  money: {
    _active: '{{age>40}}',
    _component: 'ElSelect',
    _formItem: { label: '退休金', prop: 'money' },
    _default: 3000,
    _mount: console.log,
    _unmount:console.log,
    _children: [
      { key: 'low', label: '普通', value: 3000, _component: 'ElOption' },
      { key: 'high', label: '高', value: 8000, _component: 'ElOption' },
    ],
    disabled: '{{age<55}}',
    label: '退休金',
  },
})

const rules = getElementPlusRules(new Pension())
const submitForm = (formEl: any) => {
  console.log(data.value)
  if (!formEl)
    return
  formEl.$.exposed?.validate((valid: boolean) => {
    if (valid) {
      ElMessage.success('submit!')
    }
    else {
      ElMessage.error('error submit!')
      return false
    }
  })
}
</script>

<template>
  <CustomForm
    ref="ruleFormRef"
    :config="config"

    :data="data"
    :model="data"
    label-width="120px"
    :rules="rules"
  />

  <ElButton type="primary" @click="submitForm(ruleFormRef)">
    Submit
  </ElButton>
  {{ data }}
</template>
