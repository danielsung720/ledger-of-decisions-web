import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { useFormValidation } from '~/composables/useFormValidation'

describe('useFormValidation', () => {
  const testSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(0, 'Age must be positive'),
    email: z.string().email('Invalid email'),
  })

  describe('initial state', () => {
    it('has empty errors and touched', () => {
      const { errors, touched } = useFormValidation()

      expect(errors.value).toEqual({})
      expect(touched.value).toEqual({})
    })
  })

  describe('validate', () => {
    it('returns true for valid data', () => {
      const { validate, errors } = useFormValidation()

      const result = validate(testSchema, {
        name: 'John',
        age: 25,
        email: 'john@example.com',
      })

      expect(result).toBe(true)
      expect(errors.value).toEqual({})
    })

    it('returns false for invalid data', () => {
      const { validate, errors } = useFormValidation()

      const result = validate(testSchema, {
        name: '',
        age: -1,
        email: 'invalid',
      })

      expect(result).toBe(false)
      expect(errors.value.name).toBe('Name is required')
      expect(errors.value.age).toBe('Age must be positive')
      expect(errors.value.email).toBe('Invalid email')
    })

    it('clears previous errors on successful validation', () => {
      const { validate, errors } = useFormValidation()

      validate(testSchema, { name: '', age: -1, email: 'invalid' })
      expect(Object.keys(errors.value).length).toBeGreaterThan(0)

      validate(testSchema, { name: 'John', age: 25, email: 'john@example.com' })
      expect(errors.value).toEqual({})
    })

    it('only keeps first error for each field', () => {
      const multiErrorSchema = z.object({
        password: z.string().min(8, 'Too short').regex(/[A-Z]/, 'Need uppercase'),
      })
      const { validate, errors } = useFormValidation()

      validate(multiErrorSchema, { password: 'abc' })

      expect(errors.value.password).toBe('Too short')
    })
  })

  describe('validateField', () => {
    it('marks field as touched', () => {
      const { validateField, touched } = useFormValidation()

      validateField(testSchema, 'name', 'John')

      expect(touched.value.name).toBe(true)
    })

    it('sets error for invalid field', () => {
      const { validateField, errors } = useFormValidation()

      validateField(testSchema, 'name', '')

      expect(errors.value.name).toBeDefined()
    })

    it('clears error for valid field', () => {
      const { validateField, setError, errors } = useFormValidation()

      setError('name', 'Some error')
      expect(errors.value.name).toBe('Some error')

      validateField(testSchema, 'name', 'Valid Name')

      expect(errors.value.name).toBeUndefined()
    })
  })

  describe('getError', () => {
    it('returns error message for field', () => {
      const { setError, getError } = useFormValidation()

      setError('email', 'Invalid email')

      expect(getError('email')).toBe('Invalid email')
    })

    it('returns empty string for field without error', () => {
      const { getError } = useFormValidation()

      expect(getError('nonexistent')).toBe('')
    })
  })

  describe('hasError', () => {
    it('returns true when field has error', () => {
      const { setError, hasError } = useFormValidation()

      setError('email', 'Invalid')

      expect(hasError('email')).toBe(true)
    })

    it('returns false when field has no error', () => {
      const { hasError } = useFormValidation()

      expect(hasError('email')).toBe(false)
    })
  })

  describe('isTouched', () => {
    it('returns true when field is touched', () => {
      const { touch, isTouched } = useFormValidation()

      touch('email')

      expect(isTouched('email')).toBe(true)
    })

    it('returns false when field is not touched', () => {
      const { isTouched } = useFormValidation()

      expect(isTouched('email')).toBe(false)
    })
  })

  describe('touch', () => {
    it('marks field as touched', () => {
      const { touch, touched } = useFormValidation()

      touch('name')

      expect(touched.value.name).toBe(true)
    })
  })

  describe('reset', () => {
    it('clears all errors and touched state', () => {
      const { setError, touch, reset, errors, touched } = useFormValidation()

      setError('email', 'Invalid')
      setError('name', 'Required')
      touch('email')
      touch('name')

      reset()

      expect(errors.value).toEqual({})
      expect(touched.value).toEqual({})
    })
  })

  describe('setError', () => {
    it('sets error for field', () => {
      const { setError, errors } = useFormValidation()

      setError('email', 'Custom error')

      expect(errors.value.email).toBe('Custom error')
    })

    it('preserves other errors', () => {
      const { setError, errors } = useFormValidation()

      setError('email', 'Email error')
      setError('name', 'Name error')

      expect(errors.value.email).toBe('Email error')
      expect(errors.value.name).toBe('Name error')
    })
  })

  describe('clearError', () => {
    it('removes error for field', () => {
      const { setError, clearError, errors } = useFormValidation()

      setError('email', 'Error')
      clearError('email')

      expect(errors.value.email).toBeUndefined()
    })

    it('preserves other errors', () => {
      const { setError, clearError, errors } = useFormValidation()

      setError('email', 'Email error')
      setError('name', 'Name error')
      clearError('email')

      expect(errors.value.email).toBeUndefined()
      expect(errors.value.name).toBe('Name error')
    })
  })
})
