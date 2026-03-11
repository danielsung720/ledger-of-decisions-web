import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DateRangeSelector from '~/components/review/DateRangeSelector.vue'

describe('DateRangeSelector', () => {
  const defaultProps = {
    preset: 'this_week' as const,
  }

  const defaultStubs = {
    Transition: {
      template: '<div><slot /></div>',
    },
  }

  describe('preset buttons', () => {
    it('renders all preset options', () => {
      const wrapper = mount(DateRangeSelector, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('今日')
      expect(wrapper.text()).toContain('本週')
      expect(wrapper.text()).toContain('本月')
      expect(wrapper.text()).toContain('自訂')
    })

    it('highlights selected preset', () => {
      const wrapper = mount(DateRangeSelector, {
        props: { preset: 'this_week' },
        global: { stubs: defaultStubs },
      })

      const buttons = wrapper.findAll('button')
      const selectedButton = buttons.find((btn) => btn.classes().includes('bg-theme-primary'))
      expect(selectedButton).toBeDefined()
    })

    it('emits update:preset when button clicked', async () => {
      const wrapper = mount(DateRangeSelector, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      const buttons = wrapper.findAll('button')
      await buttons[1].trigger('click')

      expect(wrapper.emitted('update:preset')).toHaveLength(1)
    })

    it('emits change when non-custom preset selected', async () => {
      const wrapper = mount(DateRangeSelector, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      const buttons = wrapper.findAll('button')
      // Click "上週"
      await buttons[1].trigger('click')

      expect(wrapper.emitted('change')).toHaveLength(1)
    })

    it('does not emit change when custom preset selected', async () => {
      const wrapper = mount(DateRangeSelector, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      const buttons = wrapper.findAll('button')
      // Click "自訂" (last button)
      await buttons[buttons.length - 1].trigger('click')

      expect(wrapper.emitted('change')).toBeUndefined()
    })
  })

  describe('custom date range', () => {
    it('does not show custom range inputs by default', () => {
      const wrapper = mount(DateRangeSelector, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      expect(wrapper.find('input[type="date"]').exists()).toBe(false)
    })

    it('shows custom range inputs when preset is custom', () => {
      const wrapper = mount(DateRangeSelector, {
        props: { preset: 'custom' as const },
        global: { stubs: defaultStubs },
      })

      const dateInputs = wrapper.findAll('input[type="date"]')
      expect(dateInputs.length).toBe(2)
    })

    it('renders start and end date labels', () => {
      const wrapper = mount(DateRangeSelector, {
        props: { preset: 'custom' as const },
        global: { stubs: defaultStubs },
      })

      expect(wrapper.text()).toContain('開始日期')
      expect(wrapper.text()).toContain('結束日期')
    })

    it('emits update:startDate when start date changes', async () => {
      const wrapper = mount(DateRangeSelector, {
        props: { preset: 'custom' as const, startDate: '', endDate: '' },
        global: { stubs: defaultStubs },
      })

      const dateInputs = wrapper.findAll('input[type="date"]')
      await dateInputs[0].setValue('2024-03-01')

      expect(wrapper.emitted('update:startDate')?.[0]).toEqual(['2024-03-01'])
    })

    it('emits update:endDate when end date changes', async () => {
      const wrapper = mount(DateRangeSelector, {
        props: { preset: 'custom' as const, startDate: '', endDate: '' },
        global: { stubs: defaultStubs },
      })

      const dateInputs = wrapper.findAll('input[type="date"]')
      await dateInputs[1].setValue('2024-03-15')

      expect(wrapper.emitted('update:endDate')?.[0]).toEqual(['2024-03-15'])
    })
  })

  describe('button types', () => {
    it('all buttons have type="button"', () => {
      const wrapper = mount(DateRangeSelector, {
        props: defaultProps,
        global: { stubs: defaultStubs },
      })

      const buttons = wrapper.findAll('button')
      buttons.forEach((button) => {
        expect(button.attributes('type')).toBe('button')
      })
    })
  })
})
