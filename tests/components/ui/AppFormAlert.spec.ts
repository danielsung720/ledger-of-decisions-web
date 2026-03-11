import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFormAlert from '~/components/ui/AppFormAlert.vue'

describe('AppFormAlert', () => {
  describe('rendering', () => {
    it('renders message text', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'This is an alert message' },
      })

      expect(wrapper.text()).toContain('This is an alert message')
    })

    it('has alert role', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Alert' },
      })

      expect(wrapper.find('[role="alert"]').exists()).toBe(true)
    })

    it('has aria-live for accessibility', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Alert' },
      })

      expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
    })
  })

  describe('error type (default)', () => {
    it('uses error type by default', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Error message' },
      })

      const container = wrapper.find('[role="alert"]')
      expect(container.classes()).toContain('bg-theme-error-light')
      expect(container.classes()).toContain('border-theme-error')
    })

    it('shows error icon for error type', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Error message', type: 'error' },
      })

      // Check that an icon is present (ExclamationTriangleIcon for error)
      const icon = wrapper.find('svg')
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain('text-theme-error')
    })

    it('applies error text color', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Error message', type: 'error' },
      })

      const text = wrapper.find('p')
      expect(text.classes()).toContain('text-theme-error')
    })
  })

  describe('success type', () => {
    it('uses success styling', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Success message', type: 'success' },
      })

      const container = wrapper.find('[role="alert"]')
      expect(container.classes()).toContain('bg-theme-success-light')
      expect(container.classes()).toContain('border-theme-success')
    })

    it('shows success icon', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Success message', type: 'success' },
      })

      const icon = wrapper.find('svg')
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain('text-theme-success')
    })

    it('applies success text color', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Success message', type: 'success' },
      })

      const text = wrapper.find('p')
      expect(text.classes()).toContain('text-theme-success')
    })
  })

  describe('info type', () => {
    it('uses info styling', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Info message', type: 'info' },
      })

      const container = wrapper.find('[role="alert"]')
      expect(container.classes()).toContain('bg-theme-info-light')
      expect(container.classes()).toContain('border-theme-info')
    })

    it('shows info icon', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Info message', type: 'info' },
      })

      const icon = wrapper.find('svg')
      expect(icon.exists()).toBe(true)
      expect(icon.classes()).toContain('text-theme-info')
    })

    it('applies info text color', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Info message', type: 'info' },
      })

      const text = wrapper.find('p')
      expect(text.classes()).toContain('text-theme-info')
    })
  })

  describe('layout', () => {
    it('has flex layout with gap', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Message' },
      })

      const container = wrapper.find('[role="alert"]')
      expect(container.classes()).toContain('flex')
      expect(container.classes()).toContain('items-center')
      expect(container.classes()).toContain('gap-2.5')
    })

    it('has rounded corners', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Message' },
      })

      const container = wrapper.find('[role="alert"]')
      expect(container.classes()).toContain('rounded-lg')
    })

    it('has border', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Message' },
      })

      const container = wrapper.find('[role="alert"]')
      expect(container.classes()).toContain('border')
    })

    it('has proper padding', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Message' },
      })

      const container = wrapper.find('[role="alert"]')
      expect(container.classes()).toContain('px-4')
      expect(container.classes()).toContain('py-3')
    })
  })

  describe('icon sizing', () => {
    it('icon has correct size classes', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Message' },
      })

      const icon = wrapper.find('svg')
      expect(icon.classes()).toContain('w-[18px]')
      expect(icon.classes()).toContain('h-[18px]')
    })

    it('icon does not shrink', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Message' },
      })

      const icon = wrapper.find('svg')
      expect(icon.classes()).toContain('flex-shrink-0')
    })
  })

  describe('long messages', () => {
    it('handles long messages properly', () => {
      const longMessage =
        'This is a very long error message that might wrap to multiple lines and should still be displayed correctly in the alert component'

      const wrapper = mount(AppFormAlert, {
        props: { message: longMessage },
      })

      expect(wrapper.text()).toContain(longMessage)
    })
  })

  describe('special characters', () => {
    it('displays messages with special characters', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: '驗證碼錯誤，請重新輸入' },
      })

      expect(wrapper.text()).toContain('驗證碼錯誤，請重新輸入')
    })

    it('displays messages with HTML entities', () => {
      const wrapper = mount(AppFormAlert, {
        props: { message: 'Error: <invalid input>' },
      })

      expect(wrapper.text()).toContain('Error: <invalid input>')
    })
  })
})
