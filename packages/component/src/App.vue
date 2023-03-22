<script setup lang="ts">
import { ref } from 'vue'
import IframeCanvas from './components/iframeCanvas.vue'
const importmap = { vue: 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.47/vue.esm-browser.min.js' }
const url = '/lib'
const data = ref({ msg: 'init' })
function changedata() {
  data.value = { msg: 'fgs' }
}
</script>

<template>
  <IframeCanvas
    :url="url"
    :data="data"
    :importmap="importmap"
  />
  <button @click="changedata">
    change
  </button>
</template>

<style scoped>

</style>
