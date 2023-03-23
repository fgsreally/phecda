<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { componentMap } from './componentMap'
import { createTableData, metaToPropsValue, updateItemTypeMeta } from './vueTypeMeta'
const props = defineProps<{ meta?: any }>()
</script>

<template>
  <el-table
    v-if="meta"
    :data="props.meta"
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
</template>

<style scoped>
.ml-2{
    margin: 8px;
}
</style>
