<script setup lang="ts">
import {inject} from 'vue'
defineProps<{ sex: number }>()
console.log(inject('test'))

</script>

<template>
  TEST1 {{ sex }}
</template>
