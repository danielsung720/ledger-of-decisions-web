import type {
  CreateRecurringExpenseRequest,
  DayOfWeek,
  UpdateRecurringExpenseRequest,
} from '~/types/recurring-expense'
import type { RecurringExpenseFormData } from '~/utils/validation'

function normalizeOptionalText(value: string | null | undefined): string | undefined {
  if (value == null) return undefined
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function normalizeOptionalTextForUpdate(
  value: string | null | undefined
): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

export function toCreateRecurringExpenseRequest(
  data: RecurringExpenseFormData
): CreateRecurringExpenseRequest {
  const note = normalizeOptionalText(data.note)

  return {
    name: data.name,
    amount_min: data.amount_min,
    category: data.category,
    frequency_type: data.frequency_type,
    start_date: data.start_date,
    ...(data.amount_max != null ? { amount_max: data.amount_max } : {}),
    ...(data.frequency_interval != null ? { frequency_interval: data.frequency_interval } : {}),
    ...(data.day_of_month != null ? { day_of_month: data.day_of_month } : {}),
    ...(data.month_of_year != null ? { month_of_year: data.month_of_year } : {}),
    ...(data.day_of_week != null ? { day_of_week: data.day_of_week as DayOfWeek } : {}),
    ...(data.end_date ? { end_date: data.end_date } : {}),
    ...(data.default_intent ? { default_intent: data.default_intent } : {}),
    ...(note ? { note } : {}),
  }
}

export function toUpdateRecurringExpenseRequest(
  data: RecurringExpenseFormData
): UpdateRecurringExpenseRequest {
  const note = normalizeOptionalTextForUpdate(data.note)

  return {
    name: data.name,
    amount_min: data.amount_min,
    category: data.category,
    frequency_type: data.frequency_type,
    start_date: data.start_date,
    ...(data.amount_max !== undefined ? { amount_max: data.amount_max } : {}),
    ...(data.frequency_interval !== undefined
      ? { frequency_interval: data.frequency_interval }
      : {}),
    ...(data.day_of_month !== undefined ? { day_of_month: data.day_of_month } : {}),
    ...(data.month_of_year !== undefined ? { month_of_year: data.month_of_year } : {}),
    ...(data.day_of_week !== undefined
      ? { day_of_week: data.day_of_week as DayOfWeek | null }
      : {}),
    ...(data.end_date !== undefined ? { end_date: data.end_date } : {}),
    ...(data.default_intent !== undefined ? { default_intent: data.default_intent } : {}),
    ...(note !== undefined ? { note } : {}),
  }
}
