<!-- eslint-disable vue/object-curly-newline -->
<!-- eslint-disable no-trailing-spaces -->
<!-- eslint-disable vue/comma-dangle -->
<!-- eslint-disable vue/dot-location -->
<!-- eslint-disable vue/block-tag-newline -->
<script setup lang="ts">

import { getR, getV, usePhecda, useV } from 'phecda-vue'
import { UserModel } from '@/models/user'

const { name, fullName, obj, createdAt } = useV(UserModel)
const { patch } = usePhecda()

function getAllMethods(obj: any) {
  const methods = new Set()

  obj = Object.getPrototypeOf(obj)
  while (obj.constructor.name !== 'Object') {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      const propDescriptor = Object.getOwnPropertyDescriptor(obj, prop) as any
      if (typeof propDescriptor.value === 'function' && prop !== 'constructor') 
        methods.add(prop)
    })
    obj = Object.getPrototypeOf(obj)
  } 

  return [...methods]
}

function changeName(n: string) {
  getV(UserModel).changeName(n)
  console.log(getAllMethods(getR(UserModel)))
  console.log('set')
  name.value = 'xxx'
  patch(UserModel, { obj: { id: Math.floor((Math.random() * 100)), n } })
}
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
