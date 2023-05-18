<script setup lang="ts">
import { useModal } from './modal'
defineProps<{ name: string }>()
</script>

<template>
  <button @click="useModal({ sex: 10 }, { title: 'modal2' })">
    打开弹窗1
  </button>
  TEST2 {{ name }}
</template>
