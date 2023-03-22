<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { createIframeHtml } from './iframeChannel'
const props = defineProps<{
  url: string, data: Object, importmap: Record<string, string>
}>()

const el = ref<HTMLIFrameElement>(null as any)
onMounted(() => {
  el.value.onload = async function () {
    const { default: comp } = await import(props.url)
    el.value.contentWindow!.load(comp, props.data)
  }
})
watch(() => props.url, (n) => {
  el.value.contentWindow!.load(n, props.data)
})
watch(() => props.data, (n) => {
  el.value.contentWindow!.update(props.data)
})
</script>

<template>
  <iframe ref="el" :srcdoc="createIframeHtml(importmap)" />
</template>

<style scoped>

</style>
