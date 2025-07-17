import { type App, reactive, shallowReactive, toRaw, watch } from 'vue'
import { type Construct, WebPhecda, bindMethod, get, getTag } from 'phecda-web'
import { setupDevtoolsPlugin } from '@vue/devtools-api'
import { INSPECTOR_ID, MUTATIONS_LAYER_ID, USE_DEVTOOLS, componentStateTypes, toastMessage } from './devtools'

export const phecdaSymbol = Symbol(process.env.NODE_ENV === 'development' ? 'phecda-vue' : undefined)

export class VuePhecda extends WebPhecda {
  vueApp: App
  install(app: App) {
    app.provide(phecdaSymbol, this)
    this.vueApp = app

    if (USE_DEVTOOLS) {
      setupDevtoolsPlugin({

        settings: {
          sendTrigger: {
            label: 'send DebuggerEvent in onTrigger to timeline',
            type: 'boolean',
            defaultValue: false,
          },
          triggerEventSync: {
            label: 'send trigger event to timeline Synchronously',
            type: 'boolean',
            defaultValue: false,
          },

          sendUpdate: {
            label: 'Record view update caused by model to timeline',
            type: 'boolean',
            defaultValue: false,
          },
        },
        id: 'dev.esm.phecda',
        label: 'Phecda Vue',
        packageName: 'phecda',
        // @todo
        // logo: 'https://phecda.vuejs.org/logo.svg',
        // homepage: 'https://phecda.vuejs.org',
        componentStateTypes,
        app: app as any,
      }, (api) => {
        const now = typeof api.now === 'function' ? api.now.bind(api) : Date.now

        api.addTimelineLayer({
          id: MUTATIONS_LAYER_ID,
          label: 'Phecda Vue',
          color: 9089261,
        })

        const watchModule = (tag: PropertyKey) => {
          watch(this.get(tag), (data) => {
            const { sendUpdate } = api.getSettings()

            if (sendUpdate) {
              api.addTimelineEvent({
                layerId: MUTATIONS_LAYER_ID,
                event: {
                  time: now(),
                  title: 'Update',
                  subtitle: String(tag),
                  data: { ...data },
                },
              })
            }

            api.notifyComponentUpdate()
            api.sendInspectorState(INSPECTOR_ID)
          }, {
            deep: true,
            onTrigger(event) {
              const { triggerEventSync, sendTrigger } = api.getSettings()
              if (sendTrigger && !triggerEventSync) {
                api.addTimelineEvent({
                  layerId: MUTATIONS_LAYER_ID,
                  event: {
                    time: now(),
                    title: 'Trigger',
                    subtitle: String(tag),
                    data: event,
                  },
                })
              }
            },
          })
          watch(this.get(tag), () => {

          }, {
            deep: true,
            flush: 'sync',
            onTrigger(event) {
              const { triggerEventSync, sendTrigger } = api.getSettings()

              if (sendTrigger && triggerEventSync) {
                api.addTimelineEvent({
                  layerId: MUTATIONS_LAYER_ID,
                  event: {
                    time: now(),
                    title: 'Trigger',
                    subtitle: String(tag),
                    data: event,
                  },
                })
              }
            },
          })
        }

        for (const tag in this.state)
          watchModule(tag)

        this.on('Instantiate', ({ tag }) => {
          api.sendInspectorTree(INSPECTOR_ID)
          watchModule(tag)
        })

        this.on('*', (type, event) => {
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: now(),
              title: type as string,
              subtitle: event.tag,
              data: event,
            },
          })
        })

        api.addInspector({
          id: INSPECTOR_ID,
          label: 'Phecda Vue',
          icon: 'storage',
          treeFilterPlaceholder: 'Search',
          actions: [
            {
              icon: 'content_copy',
              action: async () => {
                toastMessage('Global state copied to clipboard.')

                await navigator.clipboard.writeText(this.serialize())
              },
              tooltip: 'Serialize and copy the state',
            },
            {
              icon: 'content_paste',
              action: async () => {
                toastMessage('Global state pasted from clipboard.')

                await this.load(await navigator.clipboard.readText())

                api.sendInspectorTree(INSPECTOR_ID)
                api.sendInspectorState(INSPECTOR_ID)
              },
              tooltip: 'Replace the state with the content of your clipboard',
            },

          ],
          nodeActions: [
            {
              icon: 'restore',
              tooltip: 'Reset the state ',
              action: (nodeId) => {
                this.reset(this.getModel(nodeId),
                )
              },
            },
          ],
        })

        api.on.inspectComponent((payload) => {
          const proxy = (payload.componentInstance
            && payload.componentInstance.proxy)
          if (proxy && proxy._phecda_vue) {
            for (const tag in proxy._phecda_vue) {
              payload.instanceData.state.push({
                type: 'phecda-vue',
                key: tag,
                editable: true,
                value: proxy._phecda_vue[tag],
              })
            }
          }
        })

        api.on.getInspectorTree((payload) => {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
            payload.rootNodes = Object.keys(this.state).map((tag) => {
              return {
                id: tag,
                label: tag,
              }
            })
          }
        })

        api.on.getInspectorState((payload) => {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
            if (this.has(payload.nodeId)) {
              const instance = this.get(payload.nodeId)
              payload.state = {
                state: [],
                methods: [],
                getters: [],

                internals: [],
                memory: Object.entries(this.memory[payload.nodeId] || {}).map(([key, value]) => {
                  return { editable: false, key, value }
                }),
              }

              Object.entries(instance).forEach(([key, value]) => {
                if (this.modelMap.has(value as any)) {
                  const tag = String(getTag(toRaw(value)))
                  payload.state.state.unshift({ editable: false, key, value: `[PV] ${tag}`, raw: `Phecda Vue Module [${tag}]` })
                  return
                }

                if (!key.startsWith('__'))
                  payload.state.state.push({ editable: true, key, value })

                else
                  payload.state.internals.push({ editable: false, key, value })
              })

              getAllGetters(instance).forEach((item) => {
                payload.state.getters.push({ editable: false, key: item, value: instance[item] })
              })

              getAllMethods(instance).forEach((item) => {
                if (typeof instance[item] === 'function')
                  payload.state[item.startsWith('__') ? 'internals' : 'methods'].push({ editable: false, key: item, value: Object.getPrototypeOf(instance)[item] })
              })
            }
          }
        })

        api.on.editInspectorState((payload) => {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
            const state = this.get(payload.nodeId)

            const { path } = payload

            payload.set(state, path, payload.state.value)
          }
        })

        api.on.editComponentState((payload) => {
          const { path, type } = payload

          if (type === 'phecda-vue')

            payload.set(this.get(path.shift()!), path, payload.state.value)
        })
      })
    }
  }
}

export function createPhecda(models?: Construct[]) {
  const phecda = new VuePhecda('vue', (instance: any) => {
    return bindMethod(get(instance, 'shallow') ? shallowReactive(instance) : reactive(instance), USE_DEVTOOLS
      ? (instance: any, key: PropertyKey) => {
        const cb = instance[key].bind(instance)
        if (findPrototypeWithMethod(instance, key).constructor.name === 'Object')
          return cb

        const tag = getTag(instance)
        return (...args: any) => {
          const name = `${tag as string}.${key as string}`
          phecda.emit(`Invoke ${name}`, { args, tag, key })
          const ret = cb(...args)

          if (ret instanceof Promise)
            ret.then(() => phecda.emit(`End ${name}(Async)`, { args, tag, key }))

          else
            phecda.emit(`End ${name}`, { args, tag, key })

          return ret
        }
      }
      : undefined)
  })

  models?.forEach(model => phecda.init(model))

  return phecda as VuePhecda
}

// work for devtools only
function findPrototypeWithMethod(instance: any, method: PropertyKey) {
  let proto = Object.getPrototypeOf(instance)
  while (proto) {
    // eslint-disable-next-line no-prototype-builtins
    if (proto.hasOwnProperty(method))
      return proto

    proto = Object.getPrototypeOf(proto)
  }
  return null
}

function getAllMethods(obj: any) {
  const methods = new Set<string>()

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

function getAllGetters(obj: any) {
  const getters = new Set<string>()

  obj = Object.getPrototypeOf(obj)
  while (obj.constructor.name !== 'Object') {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      const propDescriptor = Object.getOwnPropertyDescriptor(obj, prop) as any
      if (typeof propDescriptor.get === 'function')
        getters.add(prop)
    })
    obj = Object.getPrototypeOf(obj)
  }

  return [...getters]
}
