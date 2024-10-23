<script setup lang="ts">
import { useV } from 'phecda-vue'
import { AboutModel } from '../models/about'
const { changeUserName, emit_update, createdAt } = useV(AboutModel)
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <section>
      <p>
        {{ createdAt.hour }} : {{ createdAt.minute }}:{{ createdAt.second }}
      </p>
    </section>
    <button @click="() => changeUserName('jane')">
      change user name to Jane
    </button>
    <button @click="emit_update">
      emit update event
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
