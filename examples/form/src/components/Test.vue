<script setup lang="ts">
import { toRef } from 'vue'
import { ElDialog } from 'element-plus'
const props = defineProps<{ sex: number }>()
</script>

<template>
  <ElDialog v-bind="$attrs">
    TEST1 {{ sex }}
  </ElDialog>
</template>
