<script setup lang="ts">
import type { StoryComponent, StoryProject } from '../types'
defineProps<{
  projects: StoryProject[]
}>()
const emits = defineEmits<{ (event: 'update', info: StoryComponent): void }>()

const defaultProps = {
  children: 'components',
  label: 'label',
}
const handleNodeClick = (node: any) => {
  if (node.url)
    emits('update', node)
}
</script>

<template>
  <el-tree :data="projects" :props="defaultProps" @node-click="handleNodeClick" />
</template>

<style scoped></style>
