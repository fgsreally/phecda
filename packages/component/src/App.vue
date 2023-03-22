<script lang="ts" setup>
import { reactive } from 'vue'
import { componentMap, initCompMap } from './components/componentMap'
import { createTableData, updateItemTypeMeta } from './components/vueTypeMeta'
import mockData from './mock.json'
const data = reactive(createTableData(mockData))
console.log(data)
initCompMap()
// const tableData: User[] = [
//   {
//     id: 1,
//     date: '2016-05-02',
//     name: 'wangxiaohu',
//     address: 'No. 189, Grove St, Los Angeles',
//   },
//   {
//     id: 2,
//     date: '2016-05-04',
//     name: 'wangxiaohu',
//     address: 'No. 189, Grove St, Los Angeles',
//   },
//   {
//     id: 3,
//     date: '2016-05-01',
//     name: 'wangxiaohu',
//     address: 'No. 189, Grove St, Los Angeles',
//     children: [
//       {
//         id: 31,
//         date: '2016-05-01',
//         name: 'wangxiaohu',
//         address: 'No. 189, Grove St, Los Angeles',
//       },
//       {
//         id: 32,
//         date: '2016-05-01',
//         name: 'wangxiaohu',
//         address: 'No. 189, Grove St, Los Angeles',
//       },
//     ],
//   },
//   {
//     id: 4,
//     date: '2016-05-03',
//     name: 'wangxiaohu',
//     address: 'No. 189, Grove St, Los Angeles',
//   },
// ]
</script>

<template>
  <div>
    {{ data }}
    <el-table
      :data="data"
      style="width: 100%; margin-bottom: 20px"
      border
      row-key="id"

      default-expand-all
    >
      <el-table-column prop="name" label="Name" fixed>
        <template #default="scope">
          <el-popover
            placement="top-start"
            :width="200"
            trigger="hover"
            :content="scope.row.description"
          >
            <template #reference>
              {{ scope.row.name }}
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="类型">
        <template #default="scope">
          <el-select v-model="scope.row.currentType" @change="updateItemTypeMeta(scope.row)">
            <el-option v-for="(item, i) in scope.row.type" :key="i" :label="item?.type || item" :value="item" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="值">
        <template #default="scope">
          <component :is="componentMap[scope.row.currentType]" v-model="scope.row.value" />
        </template>
      </el-table-column>
      <el-table-column label="标签">
        <template #default="scope">
          <el-popover
            v-for="(item, i) in scope.row.tags || []"
            :key="i"
            :width="200"
            trigger="hover"
            :content="item.text"
          >
            <template #reference>
              <el-tag class="ml-2" type="success">
                {{ item.name }}
              </el-tag>
            </template>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.ml-2{
    margin: 8px;
}
</style>
