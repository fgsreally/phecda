<script setup lang="ts">
import { h } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import Test from './components/Test.vue'
import { Pipe } from './pipe'
const vnode = Pipe(Test, { name: 'inner', onNew: () => console.log('new') }).to(HelloWorld, { msg: 'fgs' }).get()
</script>

<template>
  <vnode />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
