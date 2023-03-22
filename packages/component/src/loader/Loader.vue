<script setup lang="ts">
import { ref } from 'vue'
const propsData = ref({})
const comp = ref(null)
window.update = (data: any) => propsData.value = data
window.load = (component: any, data: any) => {
  propsData.value = data
  comp.value = component
}
</script>

<template>
  <component :is="comp" v-bind="propsData" />
</template>

<style scoped>

</style>
