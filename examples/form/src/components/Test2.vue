<script setup lang="ts">
import { useModal2 } from './modal'
import Test from './Test.vue'
defineProps<{ name: string }>()
</script>

<template>
  <button @click="useModal2(Test, { sex: 10 })">
    打开弹窗1
  </button>
  TEST2 {{ name }}
</template>
