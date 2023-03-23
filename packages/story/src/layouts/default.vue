<script setup lang="ts">
import { Pane, Splitpanes } from 'splitpanes'
import { computed, reactive, ref } from 'vue'
import 'splitpanes/dist/splitpanes.css'
import CompTree from '../components/CompTree.vue'
import PropsPane from '../components/PropsPane.vue'
import iframeCanvas from '../components/iframeCanvas.vue'
import { createTableData, metaToPropsValue } from '../components/vueTypeMeta'
import { store } from '../stores'
import type { StoryComponent, StoryConfig } from '../types'
defineProps<StoryConfig>()
const url = reactive({
  js: '',
  css: '',
})
const metaProps = ref<any>(null)
const name = ref('')
const label = ref('')
const pane = ref<any>(null)
defineExpose({ name, label, url })

const propsData = computed(() => {
  const data = {}
  return metaProps.value ? metaToPropsValue(data, metaProps.value) : data
})

async function update(info: StoryComponent) {
  const { url: compUrl, metaUrl, cssUrl } = info
  url.js = compUrl
  url.css = cssUrl
  if (!store.components[metaUrl]) {
    const ret = await import(metaUrl)
    store.components[metaUrl] = ret
  }
  metaProps.value = createTableData(store.components[metaUrl].metadata.props)
}
</script>

<template>
  <Splitpanes>
    <Pane min-size="20">
      <CompTree :projects="projects" @update="update" />
    </Pane>
    <Pane>
      <Splitpanes horizontal>
        <Pane>
          <iframeCanvas :url="url.js" :css-url="url.css" :props-data="propsData" :importmap="importmap" />
        </Pane>
        <Pane><PropsPane ref="pane" :meta="metaProps" /></Pane>
      </Splitpanes>
    </Pane>
  </Splitpanes>
  {{ propsData }}
</template>

<style scoped></style>
