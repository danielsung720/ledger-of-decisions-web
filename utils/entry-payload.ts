import type { CreateEntryRequest, UpdateEntryRequest } from '~/types'
import type { ExpenseFormData } from '~/utils/validation'

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

export function toCreateEntryRequest(data: ExpenseFormData): CreateEntryRequest {
  const note = normalizeOptionalText(data.note)
  const decisionNote = normalizeOptionalText(data.decision_note)

  return {
    amount: data.amount,
    category: data.category,
    occurred_at: data.occurred_at,
    intent: data.intent,
    ...(data.confidence_level ? { confidence_level: data.confidence_level } : {}),
    ...(note ? { note } : {}),
    ...(decisionNote ? { decision_note: decisionNote } : {}),
  }
}

export function toUpdateEntryRequest(data: ExpenseFormData): UpdateEntryRequest {
  const note = normalizeOptionalTextForUpdate(data.note)
  const decisionNote = normalizeOptionalTextForUpdate(data.decision_note)

  return {
    amount: data.amount,
    category: data.category,
    occurred_at: data.occurred_at,
    intent: data.intent,
    ...(data.confidence_level !== undefined ? { confidence_level: data.confidence_level } : {}),
    ...(note !== undefined ? { note } : {}),
    ...(decisionNote !== undefined ? { decision_note: decisionNote } : {}),
  }
}
