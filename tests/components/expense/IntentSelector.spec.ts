import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IntentSelector from '~/components/expense/IntentSelector.vue'

describe('IntentSelector', () => {
  const global = {
    stubs: {
      AppIcon: {
        props: ['name'],
        template: '<span>{{ name }}</span>',
      },
    },
  }

  describe('rendering', () => {
    it('renders label', () => {
      const wrapper = mount(IntentSelector, {
        props: { modelValue: null },
        global,
      })

      expect(wrapper.text()).toContain('這筆消費的決策意圖是？')
    })

    it('renders all 5 intent options', () => {
      const wrapper = mount(IntentSelector, {
        props: { modelValue: null },
        global,
      })

      expect(wrapper.text()).toContain('必要')
      expect(wrapper.text()).toContain('效率')
      expect(wrapper.text()).toContain('享受')
      expect(wrapper.text()).toContain('恢復')
      expect(wrapper.text()).toContain('衝動')
    })

    it('renders intent icons', () => {
      const wrapper = mount(IntentSelector, {
        props: { modelValue: null },
        global,
      })

      expect(wrapper.text()).toContain('circle-check')
      expect(wrapper.text()).toContain('bolt')
      expect(wrapper.text()).toContain('sparkles')
    })

    it('renders intent sub-labels', () => {
      const wrapper = mount(IntentSelector, {
        props: { modelValue: null },
        global,
      })

      expect(wrapper.text()).toContain('支出')
      expect(wrapper.text()).toContain('提升')
      expect(wrapper.text()).toContain('生活')
      expect(wrapper.text()).toContain('身心')
      expect(wrapper.text()).toContain('消費')
    })
  })

  describe('selection', () => {
    it('emits update:modelValue on click', async () => {
      const wrapper = mount(IntentSelector, {
        props: { modelValue: null },
        global,
      })

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['necessity'])
    })

    it('emits different intents for each button', async () => {
      const wrapper = mount(IntentSelector, {
        props: { modelValue: null },
        global,
      })

      const buttons = wrapper.findAll('button')
      const expectedIntents = ['necessity', 'efficiency', 'enjoyment', 'recovery', 'impulse']

      for (let i = 0; i < buttons.length; i++) {
        await buttons[i].trigger('click')
        expect(wrapper.emitted('update:modelValue')?.[i]).toEqual([expectedIntents[i]])
      }
    })
  })

  describe('selected state', () => {
    it('shows selected state for necessity', () => {
      const wrapper = mount(IntentSelector, {
        props: { modelValue: 'necessity' },
        global,
      })

      const buttons = wrapper.findAll('button')
      expect(buttons[0].classes()).toContain('border-2')
    })

    it('shows selected state for impulse', () => {
      const wrapper = mount(IntentSelector, {
        props: { modelValue: 'impulse' },
        global,
      })

      const buttons = wrapper.findAll('button')
      expect(buttons[4].classes()).toContain('border-2')
    })

    it('shows unselected state for non-selected intents', () => {
      const wrapper = mount(IntentSelector, {
        props: { modelValue: 'necessity' },
        global,
      })

      const buttons = wrapper.findAll('button')
      // Other buttons should not have border-2
      expect(buttons[1].classes()).not.toContain('border-2')
      expect(buttons[2].classes()).not.toContain('border-2')
    })
  })

  describe('error state', () => {
    it('does not show error when not provided', () => {
      const wrapper = mount(IntentSelector, {
        props: { modelValue: null },
        global,
      })

      expect(wrapper.find('.text-theme-error').exists()).toBe(false)
    })

    it('shows error message when provided', () => {
      const wrapper = mount(IntentSelector, {
        props: { modelValue: null, error: 'Please select an intent' },
        global,
      })

      expect(wrapper.text()).toContain('Please select an intent')
      expect(wrapper.find('.text-theme-error').exists()).toBe(true)
    })
  })

  describe('button behavior', () => {
    it('all buttons have type="button"', () => {
      const wrapper = mount(IntentSelector, {
        props: { modelValue: null },
        global,
      })

      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.attributes('type')).toBe('button')
      })
    })
  })
})
