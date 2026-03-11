import { describe, expect, it } from 'vitest'
import { toCreateEntryRequest, toUpdateEntryRequest } from '~/utils/entry-payload'

describe('entry-payload', () => {
  it('builds create payload with required fields only when optionals are empty', () => {
    const payload = toCreateEntryRequest({
      amount: 500,
      category: 'food',
      occurred_at: '2026-02-15 10:00:00',
      intent: 'necessity',
      note: '   ',
      confidence_level: null,
      decision_note: '',
    })

    expect(payload).toEqual({
      amount: 500,
      category: 'food',
      occurred_at: '2026-02-15 10:00:00',
      intent: 'necessity',
    })
  })

  it('builds create payload with normalized optional fields', () => {
    const payload = toCreateEntryRequest({
      amount: 800,
      category: 'transport',
      occurred_at: '2026-02-15 11:00:00',
      intent: 'efficiency',
      note: '  taxi  ',
      confidence_level: 'high',
      decision_note: '  late meeting  ',
    })

    expect(payload).toEqual({
      amount: 800,
      category: 'transport',
      occurred_at: '2026-02-15 11:00:00',
      intent: 'efficiency',
      note: 'taxi',
      confidence_level: 'high',
      decision_note: 'late meeting',
    })
  })

  it('builds update payload with same contract as create payload', () => {
    const payload = toUpdateEntryRequest({
      amount: 950,
      category: 'living',
      occurred_at: '2026-02-15 12:00:00',
      intent: 'recovery',
      note: null,
      confidence_level: 'medium',
      decision_note: '  quality rest  ',
    })

    expect(payload).toEqual({
      amount: 950,
      category: 'living',
      occurred_at: '2026-02-15 12:00:00',
      intent: 'recovery',
      note: null,
      confidence_level: 'medium',
      decision_note: 'quality rest',
    })
  })

  it('builds update payload with null fields when optional text is cleared', () => {
    const payload = toUpdateEntryRequest({
      amount: 960,
      category: 'living',
      occurred_at: '2026-02-15 13:00:00',
      intent: 'necessity',
      note: '   ',
      confidence_level: null,
      decision_note: '',
    })

    expect(payload).toEqual({
      amount: 960,
      category: 'living',
      occurred_at: '2026-02-15 13:00:00',
      intent: 'necessity',
      confidence_level: null,
      note: null,
      decision_note: null,
    })
  })
})
