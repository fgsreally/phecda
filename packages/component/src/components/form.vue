<script setup lang="ts">
import { nextTick, ref } from 'vue'

const genderRef = ref()
const tableRef = ref()
const dataSource = ref([
  {
    firstName: 'Mark',
    lastName: 'Otto',
    gender: 'Male',
    id: 'Mark',
  },
  {
    firstName: 'Jacob',
    lastName: 'Thornton',
    gender: 'Female',
    id: 'Jacob',
  },
])

const options = ref(['Female', 'Male'])

const change = (row, rowIndex, field, value) => {
  dataSource.value[rowIndex][field] = typeof value === 'object' ? value.value : value
  tableRef.value.store.setCellMode(row, rowIndex, field, 'readonly')
}
const blur = (row, rowIndex, field) => {
  tableRef.value.store.setCellMode(row, rowIndex, field, 'readonly')
}

const cellClick = (obj) => {
  tableRef.value.store.setCellMode(obj.row, obj.rowIndex, obj.column.field, 'edit')
  const refMap = {
    firstName: firstNameRef,
    lastName: lastNameRef,
    gender: genderRef,
  }
  const targetRef = refMap[obj.column.field]
  nextTick(() => {
    targetRef?.value?.focus()
  })
}
</script>

<template>
  <d-table ref="tableRef" :data="dataSource" row-key="id" @cellClick="cellClick">
    <d-column field="value" width="80">
      <template #default="scope">
        <component :is="" />
      </template>
    </d-column>
    <d-column field="firstName" header="First Name" show-overflow-tooltip />

    <d-column field="gender" header="类型" type="editable">
      <template #cell="scope">
        {{ scope.row.gender }}
      </template>
      <template #cellEdit="scope">
        <d-select
          ref="genderRef"
          v-model="scope.row.gender"
          :options="options"
          @valueChange="(value) => change(scope.row, scope.rowIndex, 'gender', value)"
        />
      </template>
    </d-column>
  </d-table>
</template>
