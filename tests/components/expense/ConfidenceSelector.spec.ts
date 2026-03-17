import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfidenceSelector from '~/components/expense/ConfidenceSelector.vue'

describe('ConfidenceSelector', () => {
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
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: null },
        global,
      })

      expect(wrapper.text()).toContain('這筆消費滿意嗎？（選填）')
    })

    it('renders all 3 confidence options', () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: null },
        global,
      })

      expect(wrapper.text()).toContain('很滿意')
      expect(wrapper.text()).toContain('還好')
      expect(wrapper.text()).toContain('有點後悔')
    })

    it('renders confidence icons', () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: null },
        global,
      })

      expect(wrapper.text()).toContain('mood-smile')
      expect(wrapper.text()).toContain('mood-neutral')
      expect(wrapper.text()).toContain('mood-sad')
    })
  })

  describe('selection', () => {
    it('emits update:modelValue on click', async () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: null },
        global,
      })

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['high'])
    })

    it('emits different confidence levels for each button', async () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: null },
        global,
      })

      const buttons = wrapper.findAll('button')
      const expectedLevels = ['high', 'medium', 'low']

      for (let i = 0; i < buttons.length; i++) {
        await buttons[i].trigger('click')
        expect(wrapper.emitted('update:modelValue')?.[i]).toEqual([expectedLevels[i]])
      }
    })
  })

  describe('toggle behavior', () => {
    it('emits null when clicking already selected option', async () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: 'high' },
        global,
      })

      const buttons = wrapper.findAll('button')
      await buttons[0].trigger('click')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([null])
    })

    it('emits new value when clicking different option', async () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: 'high' },
        global,
      })

      const buttons = wrapper.findAll('button')
      await buttons[1].trigger('click')

      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['medium'])
    })
  })

  describe('selected state', () => {
    it('shows selected state for high confidence', () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: 'high' },
        global,
      })

      const buttons = wrapper.findAll('button')
      expect(buttons[0].classes()).toContain('border-2')
      expect(buttons[0].classes()).toContain('bg-success-50')
    })

    it('shows selected state for medium confidence', () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: 'medium' },
        global,
      })

      const buttons = wrapper.findAll('button')
      expect(buttons[1].classes()).toContain('border-2')
      expect(buttons[1].classes()).toContain('bg-cream-100')
    })

    it('shows selected state for low confidence', () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: 'low' },
        global,
      })

      const buttons = wrapper.findAll('button')
      expect(buttons[2].classes()).toContain('border-2')
      expect(buttons[2].classes()).toContain('bg-alert-50')
    })

    it('shows unselected state for non-selected options', () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: 'high' },
        global,
      })

      const buttons = wrapper.findAll('button')
      expect(buttons[1].classes()).not.toContain('border-2')
      expect(buttons[2].classes()).not.toContain('border-2')
    })

    it('shows unselected state when nothing selected', () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: null },
        global,
      })

      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.classes()).not.toContain('border-2')
      })
    })
  })

  describe('button behavior', () => {
    it('all buttons have type="button"', () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: null },
        global,
      })

      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.attributes('type')).toBe('button')
      })
    })

    it('renders 3 buttons', () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: null },
        global,
      })

      expect(wrapper.findAll('button').length).toBe(3)
    })
  })

  describe('styling', () => {
    it('buttons have rounded-full class', () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: null },
        global,
      })

      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.classes()).toContain('rounded-full')
      })
    })

    it('centers the confidence button group horizontally', () => {
      const wrapper = mount(ConfidenceSelector, {
        props: { modelValue: null },
        global,
      })

      expect(wrapper.find('.flex.flex-wrap').classes()).toContain('justify-center')
    })
  })
})
