<script setup lang="ts">
const { isUse } = defineModel<{
  isUse: boolean
}>()
</script>

<template>
  <div>
    <d-switch v-model="isUse" />
    <d-input $attrs />
  </div>
</template>

<style scoped>

</style>
