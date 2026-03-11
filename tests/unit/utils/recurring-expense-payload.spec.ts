import { describe, it, expect } from 'vitest'
import {
  toCreateRecurringExpenseRequest,
  toUpdateRecurringExpenseRequest,
} from '~/utils/recurring-expense-payload'

describe('recurring-expense-payload', () => {
  const fullData = {
    name: 'Netflix',
    amount_min: 390,
    amount_max: 420,
    category: 'living',
    frequency_type: 'monthly',
    frequency_interval: 1,
    day_of_month: 15,
    month_of_year: null,
    day_of_week: null,
    start_date: '2026-02-01',
    end_date: '2026-12-31',
    default_intent: 'enjoyment',
    note: '  family plan  ',
  } as const

  it('maps create payload with optional fields', () => {
    expect(toCreateRecurringExpenseRequest(fullData)).toEqual({
      name: 'Netflix',
      amount_min: 390,
      amount_max: 420,
      category: 'living',
      frequency_type: 'monthly',
      frequency_interval: 1,
      day_of_month: 15,
      start_date: '2026-02-01',
      end_date: '2026-12-31',
      default_intent: 'enjoyment',
      note: 'family plan',
    })
  })

  it('omits empty optional fields from create payload', () => {
    const payload = toCreateRecurringExpenseRequest({
      name: 'Gym',
      amount_min: 1200,
      amount_max: null,
      category: 'training',
      frequency_type: 'monthly',
      frequency_interval: null,
      day_of_month: null,
      month_of_year: null,
      day_of_week: null,
      start_date: '2026-02-01',
      end_date: '',
      default_intent: null,
      note: '   ',
    })

    expect(payload).toEqual({
      name: 'Gym',
      amount_min: 1200,
      category: 'training',
      frequency_type: 'monthly',
      start_date: '2026-02-01',
    })
  })

  it('reuses the same mapping for update payload', () => {
    expect(toUpdateRecurringExpenseRequest(fullData)).toEqual({
      name: 'Netflix',
      amount_min: 390,
      amount_max: 420,
      category: 'living',
      frequency_type: 'monthly',
      frequency_interval: 1,
      day_of_month: 15,
      month_of_year: null,
      day_of_week: null,
      start_date: '2026-02-01',
      end_date: '2026-12-31',
      default_intent: 'enjoyment',
      note: 'family plan',
    })
  })

  it('sends nullable fields as null when clearing optionals in update payload', () => {
    const payload = toUpdateRecurringExpenseRequest({
      name: 'Gym',
      amount_min: 1200,
      amount_max: null,
      category: 'training',
      frequency_type: 'monthly',
      frequency_interval: 1,
      day_of_month: null,
      month_of_year: null,
      day_of_week: null,
      start_date: '2026-02-01',
      end_date: null,
      default_intent: null,
      note: '   ',
    })

    expect(payload).toEqual({
      name: 'Gym',
      amount_min: 1200,
      amount_max: null,
      category: 'training',
      frequency_type: 'monthly',
      frequency_interval: 1,
      day_of_month: null,
      month_of_year: null,
      day_of_week: null,
      start_date: '2026-02-01',
      end_date: null,
      default_intent: null,
      note: null,
    })
  })
})
