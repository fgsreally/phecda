interface ShareConfig {
  id: string
  label: string
}

export interface StoryProject extends ShareConfig {
  components: StoryComponent[]

}

export interface StoryComponent extends ShareConfig {
  url: string
  cssUrl: string
  metaUrl: string
}

export interface StoryConfig {
  projects: StoryProject[]
  importmap: Record<string, string>

}

export interface StoryStore {
  components: {
    [url in string]: {
      metadata: any
    }
  }
}
