import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CompactStatsCard from '~/components/dashboard/CompactStatsCard.vue'

describe('CompactStatsCard', () => {
  const global = {
    stubs: {
      AppIcon: {
        props: ['name'],
        template: '<span>{{ name }}</span>',
      },
    },
  }

  it('renders currency value and sub text', () => {
    const wrapper = mount(CompactStatsCard, {
      props: {
        title: '今日消費',
        icon: 'sun',
        amount: 1200,
        subText: '3 筆記錄',
      },
      global,
    })

    expect(wrapper.text()).toContain('今日消費')
    expect(wrapper.text()).toContain('$1,200')
    expect(wrapper.text()).toContain('3 筆記錄')
    expect(wrapper.text()).toContain('sun')
  })

  it('renders percentage when is impulse card', () => {
    const wrapper = mount(CompactStatsCard, {
      props: {
        title: '本月衝動佔比',
        icon: 'comet',
        ratio: 18,
        subText: '5 筆衝動消費',
        isImpulse: true,
      },
      global,
    })

    expect(wrapper.text()).toContain('18%')
    expect(wrapper.text()).toContain('5 筆衝動消費')
  })

  it('uses empty-state text when value is zero', () => {
    const wrapper = mount(CompactStatsCard, {
      props: {
        title: '本月支出',
        icon: 'calendar-month',
        amount: 0,
        subText: '0 筆記錄',
      },
      global,
    })

    expect(wrapper.text()).toContain('$0')
    expect(wrapper.text()).toContain('尚無記錄')
  })

  it('shows skeleton when loading', () => {
    const wrapper = mount(CompactStatsCard, {
      props: {
        title: '本月支出',
        icon: 'calendar-month',
        amount: 100,
        subText: '1 筆記錄',
        loading: true,
      },
      global,
    })

    expect(wrapper.findAll('.skeleton-pulse').length).toBe(2)
    expect(wrapper.text()).not.toContain('本月支出')
  })
})
