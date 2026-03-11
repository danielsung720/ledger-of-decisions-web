import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppSpinner from '~/components/ui/AppSpinner.vue'

describe('AppSpinner', () => {
  describe('rendering', () => {
    it('renders svg element', () => {
      const wrapper = mount(AppSpinner)

      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('has animate-spin class', () => {
      const wrapper = mount(AppSpinner)

      expect(wrapper.find('svg').classes()).toContain('animate-spin')
    })

    it('has viewBox attribute', () => {
      const wrapper = mount(AppSpinner)

      expect(wrapper.find('svg').attributes('viewBox')).toBe('0 0 24 24')
    })
  })

  describe('sizes', () => {
    it('applies md size by default', () => {
      const wrapper = mount(AppSpinner)

      expect(wrapper.find('svg').classes()).toContain('w-6')
      expect(wrapper.find('svg').classes()).toContain('h-6')
    })

    it('applies sm size', () => {
      const wrapper = mount(AppSpinner, {
        props: { size: 'sm' },
      })

      expect(wrapper.find('svg').classes()).toContain('w-4')
      expect(wrapper.find('svg').classes()).toContain('h-4')
    })

    it('applies lg size', () => {
      const wrapper = mount(AppSpinner, {
        props: { size: 'lg' },
      })

      expect(wrapper.find('svg').classes()).toContain('w-8')
      expect(wrapper.find('svg').classes()).toContain('h-8')
    })
  })

  describe('svg content', () => {
    it('contains circle element', () => {
      const wrapper = mount(AppSpinner)

      expect(wrapper.find('circle').exists()).toBe(true)
    })

    it('contains path element', () => {
      const wrapper = mount(AppSpinner)

      expect(wrapper.find('path').exists()).toBe(true)
    })

    it('circle has stroke-width attribute', () => {
      const wrapper = mount(AppSpinner)

      expect(wrapper.find('circle').attributes('stroke-width')).toBe('4')
    })
  })
})
