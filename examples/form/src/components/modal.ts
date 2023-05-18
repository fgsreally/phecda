import { createLayer, createModal } from 'phecda-vue'
import { ElDialog } from 'element-plus'
import Test from './Test.vue'
export const useLayer = createLayer(ElDialog, { center: true })
export const useModal = createModal(ElDialog, Test)
