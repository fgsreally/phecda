<script setup lang="ts">
import { inject } from 'vue';
import { useModal } from './modal'
defineProps<{ name: string }>()
console.log(inject('test'))
</script>

<template>
  <button @click="useModal({ sex: 10 }, { title: 'modal2' })">
    打开弹窗1
  </button>
  TEST2 {{ name }}
</template>
