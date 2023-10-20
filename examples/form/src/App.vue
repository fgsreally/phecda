<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Element from './ElementForm.vue'
import Naive from './NaiveForm.vue'
import ModalTest from './ModalTest.vue'
import Table from './ArcoTable.vue'
import ElementTable from './ElementTable.vue'
import Arco from './ArcoForm.vue'
import './components/modal'
</script>

<template>
  <ModalTest />
  <Element />
  <Naive />
  <Table />
  <ElementTable />
  <Arco />
</template>

<style scoped></style>
