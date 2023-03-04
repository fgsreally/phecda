<script setup lang="ts">
import { createTable } from 'phecda-vue'
import { ElTable, ElTableColumn } from 'element-plus'
import Test3 from './components/Test3.vue'

const data = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-08',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-06',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-07',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
]
const CustomTable = createTable({ test: Test3 }, ElTable, ElTableColumn, data)
const config = [
  {
    type: 'selection',
  },
  {
    property: 'name',
    label: 'Name',
  },
  {
    _component: 'test',
    label: 'button',
  },
]
</script>

<template>
  <CustomTable :config="config" :data="data" />
</template>

<style scoped>

</style>
