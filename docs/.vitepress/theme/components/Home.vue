<script setup>
import Theme from 'vitepress/theme'
const { Layout } = Theme
</script>

<template>
  <Layout>
    <template #home-hero-image>
      <spline-viewer
        ref="el" loading-anim-type="spinner-small-dark"
        url="https://prod.spline.design/5LO-7-aInDCm0cWL/scene.splinecode"
      />
    </template>
  </Layout>
</template>
