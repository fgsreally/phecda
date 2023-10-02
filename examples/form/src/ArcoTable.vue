<script setup lang="ts">
import { createTable } from 'phecda-vue'
import { Button, Table, TableColumn } from '@arco-design/web-vue'

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
const CustomTable = createTable({ button: Button }, {
  table: Table,
  column: TableColumn,
  data,
  columnSlot: 'columns',
  cellSlot: 'cell',
})
const config = [

  {
    'data-index': 'name',
    'title': 'Name',
  },
  {
    title: 'address',
    _children: [
      {
        'data-index': 'address',
    'title': 'address',
      },
      {
        'data-index': 'date',
    'title': 'date',
      },
    ],
  },
  {
    _component: 'button',
    title: 'button',
    _props: ({ record }: any) => {
      return { _slots: record.name, onClick: () => console.log(record.name) }
    },

  },
]
</script>

<template>
  <CustomTable :config="config" :data="data" />
</template>

<style scoped>

</style>
