import { describe, it, expect } from 'vitest'
import {
  expenseFormSchema,
  dateRangeSchema,
  recurringExpenseFormSchema,
  validateForm,
  isValidCategory,
  isValidIntent,
  isValidConfidenceLevel,
  isValidFrequencyType,
} from '~/utils/validation'

describe('validation', () => {
  describe('expenseFormSchema', () => {
    it('validates a complete valid expense form', () => {
      const validData = {
        amount: 500,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
        confidence_level: 'high',
        note: 'Lunch',
        decision_note: 'Needed to eat',
      }
      const result = expenseFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates minimal required fields', () => {
      const validData = {
        amount: 100,
        category: 'transport',
        occurred_at: '2024-03-15',
        intent: 'efficiency',
      }
      const result = expenseFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects missing amount', () => {
      const invalidData = {
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
      }
      const result = expenseFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects zero amount', () => {
      const invalidData = {
        amount: 0,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
      }
      const result = expenseFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('金額必須大於 0')
      }
    })

    it('rejects negative amount', () => {
      const invalidData = {
        amount: -100,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
      }
      const result = expenseFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects amount exceeding 10 million', () => {
      const invalidData = {
        amount: 10000001,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
      }
      const result = expenseFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('金額不可超過一千萬')
      }
    })

    it('rejects invalid category', () => {
      const invalidData = {
        amount: 100,
        category: 'invalid',
        occurred_at: '2024-03-15',
        intent: 'necessity',
      }
      const result = expenseFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('validates all valid categories', () => {
      const categories = ['food', 'transport', 'training', 'living', 'other']
      categories.forEach((category) => {
        const data = {
          amount: 100,
          category,
          occurred_at: '2024-03-15',
          intent: 'necessity',
        }
        const result = expenseFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('rejects empty occurred_at', () => {
      const invalidData = {
        amount: 100,
        category: 'food',
        occurred_at: '',
        intent: 'necessity',
      }
      const result = expenseFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('rejects invalid intent', () => {
      const invalidData = {
        amount: 100,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'invalid',
      }
      const result = expenseFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('validates all valid intents', () => {
      const intents = ['necessity', 'efficiency', 'enjoyment', 'recovery', 'impulse']
      intents.forEach((intent) => {
        const data = {
          amount: 100,
          category: 'food',
          occurred_at: '2024-03-15',
          intent,
        }
        const result = expenseFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('validates all valid confidence levels', () => {
      const levels = ['high', 'medium', 'low']
      levels.forEach((confidence_level) => {
        const data = {
          amount: 100,
          category: 'food',
          occurred_at: '2024-03-15',
          intent: 'necessity',
          confidence_level,
        }
        const result = expenseFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('allows null confidence_level', () => {
      const data = {
        amount: 100,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
        confidence_level: null,
      }
      const result = expenseFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects note exceeding 500 characters', () => {
      const invalidData = {
        amount: 100,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
        note: 'x'.repeat(501),
      }
      const result = expenseFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('備註不可超過 500 字')
      }
    })

    it('rejects decision_note exceeding 1000 characters', () => {
      const invalidData = {
        amount: 100,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
        decision_note: 'x'.repeat(1001),
      }
      const result = expenseFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('決策備註不可超過 1000 字')
      }
    })
  })

  describe('dateRangeSchema', () => {
    it('validates empty date range', () => {
      const result = dateRangeSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('validates start date only', () => {
      const result = dateRangeSchema.safeParse({ startDate: '2024-03-01' })
      expect(result.success).toBe(true)
    })

    it('validates end date only', () => {
      const result = dateRangeSchema.safeParse({ endDate: '2024-03-31' })
      expect(result.success).toBe(true)
    })

    it('validates valid date range', () => {
      const result = dateRangeSchema.safeParse({
        startDate: '2024-03-01',
        endDate: '2024-03-31',
      })
      expect(result.success).toBe(true)
    })

    it('validates same start and end date', () => {
      const result = dateRangeSchema.safeParse({
        startDate: '2024-03-15',
        endDate: '2024-03-15',
      })
      expect(result.success).toBe(true)
    })

    it('rejects start date after end date', () => {
      const result = dateRangeSchema.safeParse({
        startDate: '2024-03-31',
        endDate: '2024-03-01',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('開始日期不可晚於結束日期')
      }
    })
  })

  describe('recurringExpenseFormSchema', () => {
    const validBaseData = {
      name: 'Monthly Rent',
      amount_min: 15000,
      category: 'living',
      frequency_type: 'monthly',
      frequency_interval: 1,
      start_date: '2024-01-01',
    }

    it('validates complete valid recurring expense', () => {
      const result = recurringExpenseFormSchema.safeParse(validBaseData)
      expect(result.success).toBe(true)
    })

    it('validates with optional fields', () => {
      const data = {
        ...validBaseData,
        amount_max: 16000,
        day_of_month: 1,
        end_date: '2025-01-01',
        default_intent: 'necessity',
        note: 'Monthly rent payment',
      }
      const result = recurringExpenseFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects missing name', () => {
      const { name: _name, ...data } = validBaseData
      const result = recurringExpenseFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
      const data = { ...validBaseData, name: '' }
      const result = recurringExpenseFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects name exceeding 255 characters', () => {
      const data = { ...validBaseData, name: 'x'.repeat(256) }
      const result = recurringExpenseFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects zero amount_min', () => {
      const data = { ...validBaseData, amount_min: 0 }
      const result = recurringExpenseFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects amount_min exceeding 10 million', () => {
      const data = { ...validBaseData, amount_min: 10000001 }
      const result = recurringExpenseFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('validates all frequency types', () => {
      const types = ['daily', 'weekly', 'monthly', 'yearly']
      types.forEach((frequency_type) => {
        const data = { ...validBaseData, frequency_type }
        const result = recurringExpenseFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('rejects frequency_interval less than 1', () => {
      const data = { ...validBaseData, frequency_interval: 0 }
      const result = recurringExpenseFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects frequency_interval greater than 100', () => {
      const data = { ...validBaseData, frequency_interval: 101 }
      const result = recurringExpenseFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('validates day_of_month in range 1-31', () => {
      const validDays = [1, 15, 31]
      validDays.forEach((day_of_month) => {
        const data = { ...validBaseData, day_of_month }
        const result = recurringExpenseFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('rejects day_of_month outside range', () => {
      const invalidDays = [0, 32]
      invalidDays.forEach((day_of_month) => {
        const data = { ...validBaseData, day_of_month }
        const result = recurringExpenseFormSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('validates month_of_year in range 1-12', () => {
      const validMonths = [1, 6, 12]
      validMonths.forEach((month_of_year) => {
        const data = { ...validBaseData, month_of_year }
        const result = recurringExpenseFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('rejects month_of_year outside range', () => {
      const invalidMonths = [0, 13]
      invalidMonths.forEach((month_of_year) => {
        const data = { ...validBaseData, month_of_year }
        const result = recurringExpenseFormSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('validates day_of_week in range 0-6', () => {
      const validDays = [0, 3, 6]
      validDays.forEach((day_of_week) => {
        const data = { ...validBaseData, day_of_week }
        const result = recurringExpenseFormSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('rejects amount_max less than amount_min', () => {
      const data = { ...validBaseData, amount_min: 20000, amount_max: 15000 }
      const result = recurringExpenseFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('最大金額必須大於或等於最小金額')
      }
    })

    it('allows amount_max equal to amount_min', () => {
      const data = { ...validBaseData, amount_max: 15000 }
      const result = recurringExpenseFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects end_date before start_date', () => {
      const data = {
        ...validBaseData,
        start_date: '2024-06-01',
        end_date: '2024-01-01',
      }
      const result = recurringExpenseFormSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('結束日期必須在開始日期之後')
      }
    })

    it('allows end_date equal to start_date', () => {
      const data = {
        ...validBaseData,
        end_date: '2024-01-01',
      }
      const result = recurringExpenseFormSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('validateForm', () => {
    it('returns success true for valid data', () => {
      const data = {
        amount: 100,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
      }
      const result = validateForm(expenseFormSchema, data)
      expect(result.success).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('returns errors for invalid data', () => {
      const data = {
        amount: -100,
        category: 'invalid',
        occurred_at: '',
        intent: 'necessity',
      }
      const result = validateForm(expenseFormSchema, data)
      expect(result.success).toBe(false)
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    })

    it('returns first error for each field', () => {
      const data = {
        amount: -100,
        category: 'food',
        occurred_at: '2024-03-15',
        intent: 'necessity',
      }
      const result = validateForm(expenseFormSchema, data)
      expect(result.success).toBe(false)
      expect(result.errors.amount).toBeDefined()
    })
  })

  describe('isValidCategory', () => {
    it('returns true for valid categories', () => {
      const categories = ['food', 'transport', 'training', 'living', 'other']
      categories.forEach((cat) => {
        expect(isValidCategory(cat)).toBe(true)
      })
    })

    it('returns false for invalid category', () => {
      expect(isValidCategory('invalid')).toBe(false)
      expect(isValidCategory('')).toBe(false)
      expect(isValidCategory(null)).toBe(false)
      expect(isValidCategory(undefined)).toBe(false)
      expect(isValidCategory(123)).toBe(false)
    })
  })

  describe('isValidIntent', () => {
    it('returns true for valid intents', () => {
      const intents = ['necessity', 'efficiency', 'enjoyment', 'recovery', 'impulse']
      intents.forEach((intent) => {
        expect(isValidIntent(intent)).toBe(true)
      })
    })

    it('returns false for invalid intent', () => {
      expect(isValidIntent('invalid')).toBe(false)
      expect(isValidIntent('')).toBe(false)
      expect(isValidIntent(null)).toBe(false)
      expect(isValidIntent(undefined)).toBe(false)
    })
  })

  describe('isValidConfidenceLevel', () => {
    it('returns true for valid confidence levels', () => {
      const levels = ['high', 'medium', 'low']
      levels.forEach((level) => {
        expect(isValidConfidenceLevel(level)).toBe(true)
      })
    })

    it('returns false for invalid confidence level', () => {
      expect(isValidConfidenceLevel('invalid')).toBe(false)
      expect(isValidConfidenceLevel('')).toBe(false)
      expect(isValidConfidenceLevel(null)).toBe(false)
    })
  })

  describe('isValidFrequencyType', () => {
    it('returns true for valid frequency types', () => {
      const types = ['daily', 'weekly', 'monthly', 'yearly']
      types.forEach((type) => {
        expect(isValidFrequencyType(type)).toBe(true)
      })
    })

    it('returns false for invalid frequency type', () => {
      expect(isValidFrequencyType('invalid')).toBe(false)
      expect(isValidFrequencyType('')).toBe(false)
      expect(isValidFrequencyType(null)).toBe(false)
    })
  })
})
