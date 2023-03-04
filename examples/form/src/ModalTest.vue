<script setup lang="ts">
import { createModal } from 'phecda-vue'
import { ElDialog } from 'element-plus'
import Test from './components/Test.vue'
import Test2 from './components/Test2.vue'
const useWrap = createModal(ElDialog)
function modalAppear() {
  if (Math.random() > 0.5)
    useWrap(Test2, { name: 'fgs' })

  else
    useWrap(Test, { sex: 1 })
}
</script>

<template>
  <button @click="modalAppear">
    createModal
  </button>
</template>
