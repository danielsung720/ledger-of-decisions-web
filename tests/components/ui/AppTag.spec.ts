import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppTag from '~/components/ui/AppTag.vue'

describe('AppTag', () => {
  const global = {
    stubs: {
      AppIcon: {
        props: ['name'],
        template: '<span>{{ name }}</span>',
      },
    },
  }

  describe('custom variant', () => {
    it('renders with custom label', () => {
      const wrapper = mount(AppTag, {
        props: { label: 'Custom Tag' },
        global,
      })

      expect(wrapper.text()).toContain('Custom Tag')
    })

    it('uses default colors for custom variant', () => {
      const wrapper = mount(AppTag, {
        props: { label: 'Test' },
        global,
      })

      expect(wrapper.classes()).toContain('bg-theme-surface-secondary')
      expect(wrapper.classes()).toContain('text-theme-text-secondary')
    })

    it('accepts custom colors', () => {
      const wrapper = mount(AppTag, {
        props: {
          label: 'Test',
          color: 'text-red-500',
          bgColor: 'bg-red-100',
        },
        global,
      })

      expect(wrapper.classes()).toContain('bg-red-100')
      expect(wrapper.classes()).toContain('text-red-500')
    })
  })

  describe('intent variant', () => {
    it('renders necessity intent', () => {
      const wrapper = mount(AppTag, {
        props: {
          variant: 'intent',
          intentValue: 'necessity',
        },
        global,
      })

      expect(wrapper.text()).toContain('必要')
    })

    it('renders efficiency intent', () => {
      const wrapper = mount(AppTag, {
        props: {
          variant: 'intent',
          intentValue: 'efficiency',
        },
        global,
      })

      expect(wrapper.text()).toContain('效率')
    })

    it('renders enjoyment intent', () => {
      const wrapper = mount(AppTag, {
        props: {
          variant: 'intent',
          intentValue: 'enjoyment',
        },
        global,
      })

      expect(wrapper.text()).toContain('享受')
    })

    it('renders recovery intent', () => {
      const wrapper = mount(AppTag, {
        props: {
          variant: 'intent',
          intentValue: 'recovery',
        },
        global,
      })

      expect(wrapper.text()).toContain('恢復')
    })

    it('renders impulse intent', () => {
      const wrapper = mount(AppTag, {
        props: {
          variant: 'intent',
          intentValue: 'impulse',
        },
        global,
      })

      expect(wrapper.text()).toContain('衝動')
    })

    it('shows intent icon', () => {
      const wrapper = mount(AppTag, {
        props: {
          variant: 'intent',
          intentValue: 'necessity',
        },
        global,
      })

      // Intent icons are rendered
      expect(wrapper.findAll('span').length).toBeGreaterThan(1)
    })
  })

  describe('confidence variant', () => {
    it('renders high confidence', () => {
      const wrapper = mount(AppTag, {
        props: {
          variant: 'confidence',
          confidenceValue: 'high',
        },
        global,
      })

      expect(wrapper.text()).toContain('很滿意')
    })

    it('renders medium confidence', () => {
      const wrapper = mount(AppTag, {
        props: {
          variant: 'confidence',
          confidenceValue: 'medium',
        },
        global,
      })

      expect(wrapper.text()).toContain('還好')
    })

    it('renders low confidence', () => {
      const wrapper = mount(AppTag, {
        props: {
          variant: 'confidence',
          confidenceValue: 'low',
        },
        global,
      })

      expect(wrapper.text()).toContain('有點後悔')
    })

    it('shows confidence emoji', () => {
      const wrapper = mount(AppTag, {
        props: {
          variant: 'confidence',
          confidenceValue: 'high',
        },
        global,
      })

      expect(wrapper.text()).toContain('mood-smile')
    })
  })

  describe('styling', () => {
    it('has rounded-full class', () => {
      const wrapper = mount(AppTag, {
        props: { label: 'Test' },
        global,
      })

      expect(wrapper.classes()).toContain('rounded-full')
    })

    it('has inline-flex class', () => {
      const wrapper = mount(AppTag, {
        props: { label: 'Test' },
        global,
      })

      expect(wrapper.classes()).toContain('inline-flex')
    })
  })
})
