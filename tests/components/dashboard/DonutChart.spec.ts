import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import DonutChart from '~/components/dashboard/DonutChart.vue'

vi.mock('vue-chartjs', () => ({
  Doughnut: {
    template: '<div data-testid="mock-doughnut" />',
  },
}))

describe('DonutChart', () => {
  it('renders chart title and test id', () => {
    const wrapper = mount(DonutChart, {
      global: { plugins: [createPinia()] },
      props: {
        data: [],
      },
    })

    expect(wrapper.text()).toContain('意圖分布')
    expect(wrapper.find('[data-testid="intent-donut-chart"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="mock-doughnut"]').exists()).toBe(true)
  })

  it('renders five legend rows with computed percentages', () => {
    const wrapper = mount(DonutChart, {
      global: { plugins: [createPinia()] },
      props: {
        data: [
          { intent: 'necessity', intent_label: '必要', total_amount: 600, count: 4 },
          { intent: 'impulse', intent_label: '衝動', total_amount: 400, count: 2 },
        ],
      },
    })

    expect(wrapper.text()).toContain('必要')
    expect(wrapper.text()).toContain('衝動')
    expect(wrapper.text()).toContain('$600')
    expect(wrapper.text()).toContain('$400')
    expect(wrapper.text()).toContain('60%')
    expect(wrapper.text()).toContain('40%')
  })

  it('shows zero legend values for empty state', () => {
    const wrapper = mount(DonutChart, {
      global: { plugins: [createPinia()] },
      props: {
        data: [],
      },
    })

    expect(wrapper.text()).toContain('$0')
    expect(wrapper.text()).toContain('0%')
  })

  it('adds pulse class when loading', () => {
    const wrapper = mount(DonutChart, {
      global: { plugins: [createPinia()] },
      props: {
        data: [],
        loading: true,
      },
    })

    expect(wrapper.find('.skeleton-pulse').exists()).toBe(true)
  })
})
