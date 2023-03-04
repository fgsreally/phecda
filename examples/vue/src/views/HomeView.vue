<script setup lang="ts">
import { usePatch, useV } from 'phecda-vue'
import TheWelcome from '../components/TheWelcome.vue'
import { HomeModel } from '@/models/home'

const { name, fullName, obj } = useV(HomeModel)
</script>

<template>
  <main>
    <div> name:{{ name }}</div>
    <div>fullName:{{ fullName }}</div>
    <div> obj.id:{{ obj.id }}</div>
    <div>obj.isChange:{{ obj.isChange }}</div>
    <button @click="usePatch(HomeModel, { obj: { isChange: true } })">
      change home name
    </button>
    <TheWelcome />
  </main>
</template>
