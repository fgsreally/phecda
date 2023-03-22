<script setup lang="ts">
defineProps<{ name: string }>()
const emits = defineEmits(['new'])
function emit() {
  console.log('emit')
  emits('new')
}
</script>

<template>
  <div @click="emit">
    {{ name }}
  </div>
</template>

<style scoped>

</style>
