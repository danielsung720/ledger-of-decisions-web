import type { Category, Currency, Intent } from './expense'

// ============================================================
// Enum Definitions
// ============================================================

/** Frequency Type */
export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly'

/** Day of Week (0 = Sunday, 1-6 = Monday to Saturday) */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

// ============================================================
// Data Models
// ============================================================

/** Recurring Expense record */
export interface RecurringExpense {
  id: number
  name: string
  amount_min: string
  amount_max: string | null
  amount_display: string
  currency: Currency
  category: Category
  category_label: string
  frequency_type: FrequencyType
  frequency_type_label: string
  frequency_interval: number
  frequency_display: string
  day_of_month: number | null
  month_of_year: number | null
  day_of_week: DayOfWeek | null
  start_date: string
  end_date: string | null
  next_occurrence: string | null
  default_intent: Intent | null
  default_intent_label: string | null
  note: string | null
  is_active: boolean
  has_amount_range: boolean
  expenses_count?: number
  created_at: string
  updated_at: string
}

// ============================================================
// Request DTOs
// ============================================================

/** Create recurring expense request */
export interface CreateRecurringExpenseRequest {
  name: string
  amount_min: number
  amount_max?: number | null
  currency?: Currency
  category: Category
  frequency_type: FrequencyType
  frequency_interval?: number
  day_of_month?: number | null
  month_of_year?: number | null
  day_of_week?: DayOfWeek | null
  start_date: string
  end_date?: string | null
  default_intent?: Intent | null
  note?: string | null
}

/** Update recurring expense request */
export interface UpdateRecurringExpenseRequest {
  name?: string
  amount_min?: number
  amount_max?: number | null
  currency?: Currency
  category?: Category
  frequency_type?: FrequencyType
  frequency_interval?: number
  day_of_month?: number | null
  month_of_year?: number | null
  day_of_week?: DayOfWeek | null
  start_date?: string
  end_date?: string | null
  default_intent?: Intent | null
  note?: string | null
  is_active?: boolean
}

/** Generate expense manually request */
export interface GenerateExpenseRequest {
  date?: string
  amount?: number
}

// ============================================================
// Query Parameters
// ============================================================

/** Recurring expense list query parameters */
export interface RecurringExpenseListParams {
  page?: number
  per_page?: number
  category?: Category | Category[]
  is_active?: boolean
  frequency_type?: FrequencyType | FrequencyType[]
}

/** Recurring expense filters for UI */
export interface RecurringExpenseFilters {
  categories?: Category[]
  frequencyTypes?: FrequencyType[]
  isActive?: boolean | null
}
