<script setup lang="ts">
import { createTable } from 'phecda-vue'
import { ElButton, ElTable, ElTableColumn } from 'element-plus'

const data = [
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  }, {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  }, {
    date: '2016-05-02',
    name: 'jerry',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
]
const CustomTable = createTable({ button: ElButton }, {
  table: ElTable,
  column: ElTableColumn,
  data,
})
const config = [

  {
    prop: 'name',
    label: 'Name',
  },
  {
    label: 'address',
    _children: [
      {
        prop: 'state',
        label: 'state',
        width: '150',
      },
      {
        prop: 'city',
        label: 'city',
        width: '150',
      },

    ],
  },
  {
    _component: 'button',
    label: 'button',
    _props: ({ row }) => {
      return {
        onClick: () => {
          console.log(row)
        },
        _slots: row.address,
      }
    },
  },
]
</script>

<template>
  <CustomTable :config="config" :data="data" />
</template>

<style scoped>

</style>
