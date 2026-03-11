// ============================================================
// Enum Definitions
// ============================================================

/** Expense Category */
export type Category = 'food' | 'transport' | 'training' | 'living' | 'other'

/** Decision Intent */
export type Intent = 'necessity' | 'efficiency' | 'enjoyment' | 'recovery' | 'impulse'

/** Confidence Level */
export type ConfidenceLevel = 'high' | 'medium' | 'low'

/** Currency (MVP: TWD only) */
export type Currency = 'TWD'

/** Sort Order */
export type SortOrder = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'

/** Date Range Preset */
export type DateRangePreset = 'today' | 'this_week' | 'this_month' | 'custom'

// ============================================================
// Data Models
// ============================================================

/** Decision annotation */
export interface Decision {
  id: number
  expense_id: number
  intent: Intent
  intent_label: string
  confidence_level: ConfidenceLevel | null
  confidence_level_label: string | null
  decision_note: string | null
  created_at: string
  updated_at: string
}

/** Expense record */
export interface Expense {
  id: number
  amount: string
  currency: Currency
  category: Category
  category_label: string
  occurred_at: string
  note: string | null
  decision?: Decision | null
  recurring_expense_id?: number | null
  is_from_recurring?: boolean
  recurring_expense?: {
    id: number
    name: string
  } | null
  created_at: string
  updated_at: string
}

// ============================================================
// Request DTOs
// ============================================================

/** Create expense request */
export interface CreateExpenseRequest {
  amount: number
  currency?: Currency
  category: Category
  occurred_at: string
  note?: string
}

/** Update expense request */
export interface UpdateExpenseRequest {
  amount?: number
  currency?: Currency
  category?: Category
  occurred_at?: string
  note?: string
}

/** Create decision request */
export interface CreateDecisionRequest {
  intent: Intent
  confidence_level?: ConfidenceLevel | null
  decision_note?: string | null
}

/** Create entry request (expense + decision combined) */
export interface CreateEntryRequest {
  amount: number
  currency?: Currency
  category: Category
  occurred_at: string
  note?: string
  intent: Intent
  confidence_level?: ConfidenceLevel
  decision_note?: string
}

/** Update entry request */
export interface UpdateEntryRequest {
  amount?: number
  currency?: Currency
  category?: Category
  occurred_at?: string
  note?: string | null
  intent?: Intent
  confidence_level?: ConfidenceLevel | null
  decision_note?: string | null
}

// ============================================================
// Query Parameters
// ============================================================

/** Expense list query parameters */
export interface ExpenseListParams {
  page?: number
  per_page?: number
  start_date?: string
  end_date?: string
  preset?: DateRangePreset
  category?: Category | Category[]
  intent?: Intent | Intent[]
  confidence_level?: ConfidenceLevel | ConfidenceLevel[]
}

/** Expense filters for UI */
export interface ExpenseFilters {
  dateFrom?: string
  dateTo?: string
  preset?: DateRangePreset
  categories?: Category[]
  intents?: Intent[]
  confidenceLevels?: ConfidenceLevel[]
  sort?: SortOrder
}
