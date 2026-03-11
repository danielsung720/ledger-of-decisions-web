import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppPagination from '~/components/ui/AppPagination.vue'

describe('AppPagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    totalItems: 100,
    perPage: 10,
  }

  describe('rendering', () => {
    it('displays item range info', () => {
      const wrapper = mount(AppPagination, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('顯示第 1 - 10 筆，共 100 筆')
    })

    it('displays correct range for middle page', () => {
      const wrapper = mount(AppPagination, {
        props: { ...defaultProps, currentPage: 5 },
      })

      expect(wrapper.text()).toContain('顯示第 41 - 50 筆，共 100 筆')
    })

    it('displays correct range for last page with partial items', () => {
      const wrapper = mount(AppPagination, {
        props: {
          currentPage: 7,
          totalPages: 7,
          totalItems: 65,
          perPage: 10,
        },
      })

      expect(wrapper.text()).toContain('顯示第 61 - 65 筆，共 65 筆')
    })
  })

  describe('navigation buttons', () => {
    it('disables prev button on first page', () => {
      const wrapper = mount(AppPagination, {
        props: defaultProps,
      })

      const prevButton = wrapper.findAll('button')[0]
      expect(prevButton.attributes('disabled')).toBeDefined()
    })

    it('enables prev button on non-first page', () => {
      const wrapper = mount(AppPagination, {
        props: { ...defaultProps, currentPage: 5 },
      })

      const prevButton = wrapper.findAll('button')[0]
      expect(prevButton.attributes('disabled')).toBeUndefined()
    })

    it('disables next button on last page', () => {
      const wrapper = mount(AppPagination, {
        props: { ...defaultProps, currentPage: 10 },
      })

      const buttons = wrapper.findAll('button')
      const nextButton = buttons[buttons.length - 1]
      expect(nextButton.attributes('disabled')).toBeDefined()
    })

    it('enables next button on non-last page', () => {
      const wrapper = mount(AppPagination, {
        props: { ...defaultProps, currentPage: 5 },
      })

      const buttons = wrapper.findAll('button')
      const nextButton = buttons[buttons.length - 1]
      expect(nextButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('page buttons', () => {
    it('shows all pages for small page count', () => {
      const wrapper = mount(AppPagination, {
        props: {
          ...defaultProps,
          totalPages: 5,
        },
      })

      const pageButtons = wrapper.findAll('button').filter((btn) => {
        const text = btn.text()
        return /^\d+$/.test(text)
      })

      expect(pageButtons.length).toBe(5)
    })

    it('shows ellipsis for large page counts', () => {
      const wrapper = mount(AppPagination, {
        props: defaultProps,
      })

      expect(wrapper.text()).toContain('...')
    })

    it('highlights current page', () => {
      const wrapper = mount(AppPagination, {
        props: { ...defaultProps, currentPage: 5 },
      })

      const currentPageButton = wrapper.findAll('button').find((btn) => btn.text() === '5')
      expect(currentPageButton?.classes()).toContain('bg-theme-primary')
    })
  })

  describe('page navigation', () => {
    it('emits update:currentPage on page click', async () => {
      const wrapper = mount(AppPagination, {
        props: defaultProps,
      })

      const pageButton = wrapper.findAll('button').find((btn) => btn.text() === '2')
      await pageButton?.trigger('click')

      expect(wrapper.emitted('update:currentPage')?.[0]).toEqual([2])
    })

    it('emits update:currentPage on prev click', async () => {
      const wrapper = mount(AppPagination, {
        props: { ...defaultProps, currentPage: 5 },
      })

      const prevButton = wrapper.findAll('button')[0]
      await prevButton.trigger('click')

      expect(wrapper.emitted('update:currentPage')?.[0]).toEqual([4])
    })

    it('emits update:currentPage on next click', async () => {
      const wrapper = mount(AppPagination, {
        props: { ...defaultProps, currentPage: 5 },
      })

      const buttons = wrapper.findAll('button')
      const nextButton = buttons[buttons.length - 1]
      await nextButton.trigger('click')

      expect(wrapper.emitted('update:currentPage')?.[0]).toEqual([6])
    })

    it('does not emit when clicking current page', async () => {
      const wrapper = mount(AppPagination, {
        props: { ...defaultProps, currentPage: 1 },
      })

      const currentPageButton = wrapper.findAll('button').find((btn) => btn.text() === '1')
      await currentPageButton?.trigger('click')

      expect(wrapper.emitted('update:currentPage')).toBeUndefined()
    })
  })

  describe('visible pages calculation', () => {
    it('shows pages 1, 2, 3, ..., 10 when on page 1', () => {
      const wrapper = mount(AppPagination, {
        props: defaultProps,
      })

      const text = wrapper.text()
      expect(text).toContain('1')
      expect(text).toContain('2')
      expect(text).toContain('...')
      expect(text).toContain('10')
    })

    it('shows pages 1, ..., 4, 5, 6, ..., 10 when on page 5', () => {
      const wrapper = mount(AppPagination, {
        props: { ...defaultProps, currentPage: 5 },
      })

      const text = wrapper.text()
      expect(text).toContain('1')
      expect(text).toContain('4')
      expect(text).toContain('5')
      expect(text).toContain('6')
      expect(text).toContain('10')
    })

    it('shows pages 1, ..., 9, 10 when on page 10', () => {
      const wrapper = mount(AppPagination, {
        props: { ...defaultProps, currentPage: 10 },
      })

      const text = wrapper.text()
      expect(text).toContain('1')
      expect(text).toContain('...')
      expect(text).toContain('9')
      expect(text).toContain('10')
    })
  })
})
