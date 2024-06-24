/* eslint-disable vue/one-component-per-file */
import { describe, expect, it } from 'vitest'

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { Init, createPhecda, usePhecda, useR, useV } from '../src'
describe('in vue component', () => {
  it('useV', async () => {
    const Comp = defineComponent({
      setup() {
        class User {
          name = ''
          changeName() {
            this.name = 'phecda-vue'
          }
        }

        const { name, changeName } = useV(User)
        return { name, changeName }
      },
      template: '<div>{{name}}</div><button @click="changeName"></button>',

    })
    const wrapper = mount(Comp, {
      global: {
        plugins: [createPhecda()],
      },
    })
    expect(wrapper.find('div').text()).toBe('')
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).toBe('phecda-vue')
  })

  it('useR', async () => {
    const Comp = defineComponent({
      setup() {
        class User {
          name = ''
          changeName() {
            this.name = 'phecda-vue'
          }
        }

        const user = useR(User)
        return { user }
      },
      template: '<div>{{user.name}}</div><button @click="user.changeName"></button>',

    })
    const wrapper = mount(Comp, {
      global: {
        plugins: [createPhecda()],
      },
    })

    expect(wrapper.find('div').text()).toBe('')
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).toBe('phecda-vue')
  })

  it('usePhecda', async () => {
    const Comp = defineComponent({
      setup() {
        class User {
          name = ''
          @Init
          changeName() {
            this.name = 'phecda-vue'
          }
        }
        const { reset } = usePhecda()
        const user = useR(User)
        return { user, reset, User }
      },
      template: '<div>{{user.name}}</div><button @click="reset(User)"></button>',

    })
    const wrapper = mount(Comp, {
      global: {
        plugins: [createPhecda()],
      },
    })

    // reset
    expect(wrapper.find('div').text()).toBe('phecda-vue')
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).toBe('')
  })
})

// ppt
// ppt

///
