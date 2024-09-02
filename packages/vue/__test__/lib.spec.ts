/* eslint-disable vue/one-component-per-file */
import { describe, expect, it } from 'vitest'

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { Expose, Init, Unmount, useIR, useIV } from '../src'
describe('in lib mode', () => {
  class User {
    age = 18
    changeAge(age: number) {
      this.age = age
    }
  }

  @Expose
  class Team {
    name = 'A'
    constructor(public user: User) {

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

  it('core decorators', () => {
    let isMount = false
    class InitUser extends User {
      @Init
      init() {
        this.age = 20
        isMount = true
      }

      @Unmount
      unmount() {
        isMount = false
      }
    }

    const wrapper = mount(defineComponent({
      setup() {
        const user = useIR(InitUser)

        return { user }
      },
      template: '<div id="container">{{user.age}}</div>',

    }))

    expect(wrapper.find('#container').text()).toBe('20')

    wrapper.unmount()

    expect(isMount).toBeFalsy()
  })

  it('params provide/inject', async () => {
    const wrapper = mount(defineComponent({

      setup() {
        const user = useIR(User)
        const team = useIR(Team)
        return { user, team }
      },
      template: '<div id="container">{{user.age}}</div><button @click="team.user.changeAge(20)"></button>',

    }))

    expect(wrapper.find('#container').text()).toBe('18')

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('#container').text()).toBe('20')
  })

  it('force provide', async () => {
    const Child1 = defineComponent({

      setup() {
        const user = useIR(User)// use User module from parent
        const team = useIR(Team, true)

        return { user, team }
      },
      template: '<div id="child">{{team.name}}--{{user.age}}</div>',

    })

    const Child2 = defineComponent({

      setup() {
        const user = useIR(User, true)
        const team = useIR(Team, true)

        return { user, team }
      },
      template: '<div id="child">{{team.name}}--{{user.age}}</div>',

    })
    const Parent = defineComponent({

      setup() {
        const user = useIR(User)
        const team = useIR(Team)
        function update() {
          user.changeAge(20)
          team.name = 'B'
        }
        return { user, team, update }
      },
      template: '<div id="parent">{{team.name}}--{{user.age}}</div><button @click="update"></button><slot></slot>',

    })

    const wrapper = mount(Parent, {
      slots: {
        default: Child1,
      },
    })
    expect(wrapper.find('#parent').text()).toBe('A--18')
    expect(wrapper.find('#child').text()).toBe('A--18')

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('#parent').text()).toBe('B--20')
    expect(wrapper.find('#child').text()).toBe('A--20')

    const wrapper2 = mount(Parent, {
      slots: {
        default: Child2,
      },
    })
    expect(wrapper2.find('#parent').text()).toBe('A--18')
    expect(wrapper2.find('#child').text()).toBe('A--18')

    await wrapper2.find('button').trigger('click')

    expect(wrapper2.find('#parent').text()).toBe('B--20')
    expect(wrapper2.find('#child').text()).toBe('A--18')
  })
})
