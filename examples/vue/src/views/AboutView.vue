<script setup lang="ts">
import { useV } from 'phecda-vue'
import { AboutModel } from '../models/about'
import { HomeModel } from '@/models/home'
const { name } = useV(HomeModel)
const { change_home_name, emit_update, data } = useV(AboutModel)
function emit() {
  emit_update()
}
</script>

<template>
  <div class="about">
    {{ name }}
    <h1>This is an about page</h1>
    {{ data }}
    <button @click="change_home_name">
      change about name
    </button>
    <button @click="emit">
      emit
    </button>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
