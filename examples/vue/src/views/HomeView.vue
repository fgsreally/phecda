<!-- eslint-disable vue/object-curly-newline -->
<!-- eslint-disable no-trailing-spaces -->
<!-- eslint-disable vue/comma-dangle -->
<!-- eslint-disable vue/dot-location -->
<!-- eslint-disable vue/block-tag-newline -->
<script setup lang="ts">
// eslint-disable-next-line vue/object-curly-newline
import { usePatch, useV } from 'phecda-vue'
import TheWelcome from '../components/TheWelcome.vue'
import { HomeModel } from '@/models/home'
const { name, fullName, obj, changeName } = useV(HomeModel)

</script>

<template>
  <main>
    <div> name:{{ name }}</div>
    <div>fullName:{{ fullName }}</div>
    <div> obj.id:{{ obj.id }}</div>
    <div>obj.isChange:{{ obj.isChange }}</div>
    <button @click="usePatch(HomeModel, { obj: { isChange: true } })">
      patch home obj
    </button>
    <button @click="changeName">
      change home name
    </button>
    <TheWelcome />
  </main>
</template>
