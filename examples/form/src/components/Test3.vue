<script setup lang="ts">
import { useAttrs ,inject} from 'vue'
import { ElButton } from 'element-plus'

const { scope: { row }, data } = useAttrs()
console.log(inject('test'))

function output() {
  console.log(data)
}
</script>

<template>
  <ElButton @click="output">
    {{ row.address }}
  </ElButton>
</template>

<style scoped>

</style>
