<!-- eslint-disable vue/comma-dangle -->
<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { reset, useR } from 'phecda-vue'
import { UserModel } from '@/models/user'

const User = useR(UserModel)
</script>

<template>
  <header>
    <RouterLink to="/">
      Home
    </RouterLink>
    <RouterLink to="/about">
      About
    </RouterLink>
    name: <p> {{ User.name }}</p>
    fullName: <p> {{ User.fullName }}</p>

    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125">

    <div class="wrapper">
      <nav>
        <button @click="()=>reset(UserModel)">
          初始化数据
        </button>
      </nav>
    </div>
  </header>

  <RouterView />
</template>
