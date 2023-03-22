import type { App } from 'vue'
export interface PhecdaStoryModule {
  onVueAppInit: (app: App) => void
}
