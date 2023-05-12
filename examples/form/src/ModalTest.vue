<script setup lang="ts">
import { useModal } from './components/modal'

import Test2 from './components/Test2.vue'
</script>

<template>
  <button
    @click=" useModal(Test2, { name: 'fgs' }, { title: 'modal1' })
    "
  >
    createModal
  </button>
</template>
