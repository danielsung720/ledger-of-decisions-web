import type { Category, Currency } from './expense'

// ============================================================
// Enum Definitions
// ============================================================

/** Cash Flow Frequency Type */
export type CashFlowFrequencyType = 'monthly' | 'yearly' | 'one_time'

// ============================================================
// Data Models
// ============================================================

/** Income record */
export interface Income {
  id: number
  name: string
  /** Decimal amount is serialized as string from API to preserve precision. */
  amount: string
  amount_display: string
  currency: Currency
  frequency_type: CashFlowFrequencyType
  frequency_type_label: string
  frequency_interval: number
  frequency_display: string
  start_date: string
  end_date: string | null
  note: string | null
  is_active: boolean
  monthly_amount: string
  created_at: string
  updated_at: string
}

/** Cash Flow Item (expense estimation) */
export interface CashFlowItem {
  id: number
  name: string
  /** Decimal amount is serialized as string from API to preserve precision. */
  amount: string
  amount_display: string
  currency: Currency
  category: Category
  category_label: string
  frequency_type: CashFlowFrequencyType
  frequency_type_label: string
  frequency_interval: number
  frequency_display: string
  start_date: string
  end_date: string | null
  note: string | null
  is_active: boolean
  monthly_amount: string
  created_at: string
  updated_at: string
}

/** Cash Flow Summary */
export interface CashFlowSummary {
  total_income: string
  total_expense: string
  net_cash_flow: string
  savings_rate: string
}

/** Cash Flow Projection for a single month */
export interface CashFlowProjection {
  month: string
  income: string
  expense: string
  net: string
  cumulative_balance: string
}

// ============================================================
// Request DTOs
// ============================================================

/** Create income request */
export interface CreateIncomeRequest {
  name: string
  /** Input uses number and is serialized by client before API submission. */
  amount: number
  currency?: Currency
  frequency_type: CashFlowFrequencyType
  frequency_interval?: number
  start_date: string
  end_date?: string | null
  note?: string | null
}

/** Update income request */
export interface UpdateIncomeRequest {
  name?: string
  /** Input uses number and is serialized by client before API submission. */
  amount?: number
  currency?: Currency
  frequency_type?: CashFlowFrequencyType
  frequency_interval?: number
  start_date?: string
  end_date?: string | null
  note?: string | null
  is_active?: boolean
}

/** Create cash flow item request */
export interface CreateCashFlowItemRequest {
  name: string
  /** Input uses number and is serialized by client before API submission. */
  amount: number
  currency?: Currency
  category: Category
  frequency_type: CashFlowFrequencyType
  frequency_interval?: number
  start_date: string
  end_date?: string | null
  note?: string | null
}

/** Update cash flow item request */
export interface UpdateCashFlowItemRequest {
  name?: string
  /** Input uses number and is serialized by client before API submission. */
  amount?: number
  currency?: Currency
  category?: Category
  frequency_type?: CashFlowFrequencyType
  frequency_interval?: number
  start_date?: string
  end_date?: string | null
  note?: string | null
  is_active?: boolean
}

// ============================================================
// Query Parameters
// ============================================================

/** Income list query parameters */
export interface IncomeListParams {
  page?: number
  per_page?: number
  is_active?: boolean
  frequency_type?: CashFlowFrequencyType
}

/** Cash flow item list query parameters */
export interface CashFlowItemListParams {
  page?: number
  per_page?: number
  category?: Category | Category[]
  is_active?: boolean
  frequency_type?: CashFlowFrequencyType
}

/** Projection query parameters */
export interface ProjectionParams {
  months?: number
}

export const CASH_FLOW_PROJECTION_MIN_MONTHS = 1
export const CASH_FLOW_PROJECTION_MAX_MONTHS = 12
export const CASH_FLOW_PROJECTION_DEFAULT_MONTHS = 1

export function normalizeProjectionMonths(months?: number | null): number {
  if (months == null || Number.isNaN(months) || !Number.isFinite(months)) {
    return CASH_FLOW_PROJECTION_DEFAULT_MONTHS
  }

  const integerMonths = Math.trunc(months)
  return Math.min(
    CASH_FLOW_PROJECTION_MAX_MONTHS,
    Math.max(CASH_FLOW_PROJECTION_MIN_MONTHS, integerMonths)
  )
}
