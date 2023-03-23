<script setup lang="ts">
import Story from './layouts/default.vue'
const importmap = { vue: 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.47/vue.esm-browser.min.js' }
const projects = [
  {
    id: '测试项目',
    label: 'test',
    components: [
      {
        id: '测试项目',
        label: 'test',
        url: 'http://localhost:3000/HelloWorld.js',
        cssUrl: 'http://localhost:3000/HelloWorld.css',
        metaUrl: 'http://localhost:3000/HelloWorld.addon.js',

      },
    ],
  },
]
</script>

<template>
  <Story :importmap="importmap" :projects="projects" />
</template>

<style scoped></style>
