import { z } from 'zod'
import type { Category, ConfidenceLevel, Intent } from '~/types'
import type { FrequencyType } from '~/types/recurring-expense'

// ============================================================
// Validation Schemas
// ============================================================

/** Expense form validation schema */
export const expenseFormSchema = z.object({
  amount: z
    .number({ required_error: '請輸入消費金額' })
    .positive('金額必須大於 0')
    .max(10000000, '金額不可超過一千萬'),

  category: z.enum(['food', 'transport', 'training', 'living', 'other'] as const, {
    required_error: '請選擇消費類別',
  }),

  occurred_at: z.string({ required_error: '請選擇消費日期' }).min(1, '請選擇消費日期'),

  note: z.string().max(500, '備註不可超過 500 字').optional().nullable(),

  intent: z.enum(['necessity', 'efficiency', 'enjoyment', 'recovery', 'impulse'] as const, {
    required_error: '請選擇決策意圖',
  }),

  confidence_level: z
    .enum(['high', 'medium', 'low'] as const)
    .optional()
    .nullable(),

  decision_note: z.string().max(1000, '決策備註不可超過 1000 字').optional().nullable(),
})

export type ExpenseFormData = z.infer<typeof expenseFormSchema>

/** Date range validation schema */
export const dateRangeSchema = z
  .object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate)
      }
      return true
    },
    {
      message: '開始日期不可晚於結束日期',
      path: ['endDate'],
    }
  )

// ============================================================
// Validation Helpers
// ============================================================

export interface ValidationResult {
  success: boolean
  errors: Record<string, string>
}

/**
 * Validate form data against schema
 */
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, errors: {} }
  }

  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }

  return { success: false, errors }
}

/**
 * Check if a value is a valid category
 */
export function isValidCategory(value: unknown): value is Category {
  return ['food', 'transport', 'training', 'living', 'other'].includes(value as string)
}

/**
 * Check if a value is a valid intent
 */
export function isValidIntent(value: unknown): value is Intent {
  return ['necessity', 'efficiency', 'enjoyment', 'recovery', 'impulse'].includes(value as string)
}

/**
 * Check if a value is a valid confidence level
 */
export function isValidConfidenceLevel(value: unknown): value is ConfidenceLevel {
  return ['high', 'medium', 'low'].includes(value as string)
}

/**
 * Check if a value is a valid frequency type
 */
export function isValidFrequencyType(value: unknown): value is FrequencyType {
  return ['daily', 'weekly', 'monthly', 'yearly'].includes(value as string)
}

// ============================================================
// Recurring Expense Validation
// ============================================================

/** Recurring expense form validation schema */
export const recurringExpenseFormSchema = z
  .object({
    name: z
      .string({ required_error: '請輸入固定支出名稱' })
      .min(1, '請輸入固定支出名稱')
      .max(255, '名稱不可超過 255 字'),

    amount_min: z
      .number({ required_error: '請輸入金額' })
      .positive('金額必須大於 0')
      .max(10000000, '金額不可超過一千萬'),

    amount_max: z
      .number()
      .positive('最大金額必須大於 0')
      .max(10000000, '金額不可超過一千萬')
      .optional()
      .nullable(),

    category: z.enum(['food', 'transport', 'training', 'living', 'other'] as const, {
      required_error: '請選擇消費類別',
    }),

    frequency_type: z.enum(['daily', 'weekly', 'monthly', 'yearly'] as const, {
      required_error: '請選擇週期類型',
    }),

    frequency_interval: z
      .number()
      .int()
      .min(1, '間隔必須至少為 1')
      .max(100, '間隔不可超過 100')
      .default(1),

    day_of_month: z
      .number()
      .int()
      .min(1, '日期必須在 1-31 之間')
      .max(31, '日期必須在 1-31 之間')
      .optional()
      .nullable(),

    month_of_year: z
      .number()
      .int()
      .min(1, '月份必須在 1-12 之間')
      .max(12, '月份必須在 1-12 之間')
      .optional()
      .nullable(),

    day_of_week: z
      .number()
      .int()
      .min(0, '星期必須在 0-6 之間')
      .max(6, '星期必須在 0-6 之間')
      .optional()
      .nullable(),

    start_date: z.string({ required_error: '請選擇開始日期' }).min(1, '請選擇開始日期'),

    end_date: z.string().optional().nullable(),

    default_intent: z
      .enum(['necessity', 'efficiency', 'enjoyment', 'recovery', 'impulse'] as const)
      .optional()
      .nullable(),

    note: z.string().max(500, '備註不可超過 500 字').optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.amount_max !== null && data.amount_max !== undefined) {
        return data.amount_max >= data.amount_min
      }
      return true
    },
    {
      message: '最大金額必須大於或等於最小金額',
      path: ['amount_max'],
    }
  )
  .refine(
    (data) => {
      if (data.end_date && data.start_date) {
        return new Date(data.end_date) >= new Date(data.start_date)
      }
      return true
    },
    {
      message: '結束日期必須在開始日期之後',
      path: ['end_date'],
    }
  )

export type RecurringExpenseFormData = z.infer<typeof recurringExpenseFormSchema>
