/* eslint-disable vue/one-component-per-file */
import { describe, expect, it } from 'vitest'

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { useIR, useIV } from '../src'
describe('in lib mode', () => {
  class User {
    age = 18
    changeAge(age: number) {
      this.age = age
    }
  }

  it('useIV', async () => {
    const Child = defineComponent({
      name: 'Child',

      setup() {
        const { age, changeAge } = useIV(User)
        return { age, changeAge }
      },
      template: '<div id="child">{{age}}</div><button @click="changeAge(20)"></button>',

    })

    const Parent = defineComponent({
      name: 'Parent',
      setup() {
        const { age } = useIV(User)
        return { age }
      },
      template: '<div id="parent">{{age}}</div><slot></slot>',

    })
    const wrapper = mount(Parent, {
      slots: {
        default: Child,
      },
    })
    expect(wrapper.find('#parent').text()).toBe('18')
    expect(wrapper.find('#child').text()).toBe('18')

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('#parent').text()).toBe('20')
    expect(wrapper.find('#child').text()).toBe('20')
  })

  it('useIR', async () => {
    const Child = defineComponent({
      name: 'Child',

      setup() {
        const user = useIR(User)
        return { user }
      },
      template: '<div id="child">{{user.age}}</div><button @click="user.changeAge(20)"></button>',

    })

    const Parent = defineComponent({
      name: 'Parent',
      setup() {
        const user = useIR(User)
        return { user }
      },
      template: '<div id="parent">{{user.age}}</div><slot></slot>',

    })
    const wrapper = mount(Parent, {
      slots: {
        default: Child,
      },
    })
    expect(wrapper.find('#parent').text()).toBe('18')
    expect(wrapper.find('#child').text()).toBe('18')

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('#parent').text()).toBe('20')
    expect(wrapper.find('#child').text()).toBe('20')
  })

  //   it('useR', async () => {
  //     const Comp = defineComponent({
  //       setup() {
  //         class User {
  //           name = ''
  //           changeName() {
  //             this.name = 'phecda-vue'
  //           }
  //         }

  //         const user = useR(User)
  //         return { user }
  //       },
  //       template: '<div>{{user.name}}</div><button @click="user.changeName"></button>',

  //     })
  //     const wrapper = mount(Comp, {
  //       global: {
  //         plugins: [createPhecda()],
  //       },
  //     })

  //     expect(wrapper.find('div').text()).toBe('')
  //     await wrapper.find('button').trigger('click')
  //     expect(wrapper.find('div').text()).toBe('phecda-vue')
  //   })

  //   it('usePhecda', async () => {
  //     const Comp = defineComponent({
  //       setup() {
  //         class User {
  //           name = ''
  //           @Init
  //           changeName() {
  //             this.name = 'phecda-vue'
  //           }
  //         }

  //         const { reset } = usePhecda()
  //         const user = useR(User)
  //         return { user, reset, User }
  //       },
  //       template: '<div>{{user.name}}</div><button @click="reset(User)"></button>',

  //     })
  //     const wrapper = mount(Comp, {
  //       global: {
  //         plugins: [createPhecda()],
  //       },
  //     })

  //     // reset
  //     expect(wrapper.find('div').text()).toBe('phecda-vue')
  //     await wrapper.find('button').trigger('click')
  //     expect(wrapper.find('div').text()).toBe('')
  //   })
})
