<!-- eslint-disable vue/object-curly-newline -->
<!-- eslint-disable no-trailing-spaces -->
<!-- eslint-disable vue/comma-dangle -->
<!-- eslint-disable vue/dot-location -->
<!-- eslint-disable vue/block-tag-newline -->
<script setup lang="ts">

import { usePhecda, useV } from 'phecda-vue'
import { UserModel } from '@/models/user'

const { name, fullName, obj, changeName, createdAt } = useV(UserModel)
const { patch } = usePhecda()
</script>

<template>
  <main>
    <section>
      <p>
        {{ createdAt.hour }} : {{ createdAt.minute }}:{{ createdAt.second }}
      </p>
      <div>name:{{ name }}</div>
      <div>fullName:{{ fullName }}</div>
      <div> obj.id:{{ obj.id }}</div>
    </section>

    <button @click="patch(UserModel, { obj: { id: Math.floor((Math.random() * 100)) } })">
      patch user id
    </button>
    <button @click="changeName('Tom')">
      change home name to Tom
    </button>
  </main>
</template>
