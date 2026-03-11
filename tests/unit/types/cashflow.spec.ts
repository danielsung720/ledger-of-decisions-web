import { describe, expect, it } from 'vitest'
import { CASH_FLOW_PROJECTION_DEFAULT_MONTHS, normalizeProjectionMonths } from '~/types/cashflow'

describe('cashflow projection month normalization', () => {
  it('returns default months when input is undefined or null', () => {
    expect(normalizeProjectionMonths(undefined)).toBe(CASH_FLOW_PROJECTION_DEFAULT_MONTHS)
    expect(normalizeProjectionMonths(null)).toBe(CASH_FLOW_PROJECTION_DEFAULT_MONTHS)
  })

  it('returns default months for NaN and Infinity', () => {
    expect(normalizeProjectionMonths(Number.NaN)).toBe(CASH_FLOW_PROJECTION_DEFAULT_MONTHS)
    expect(normalizeProjectionMonths(Number.POSITIVE_INFINITY)).toBe(
      CASH_FLOW_PROJECTION_DEFAULT_MONTHS
    )
    expect(normalizeProjectionMonths(Number.NEGATIVE_INFINITY)).toBe(
      CASH_FLOW_PROJECTION_DEFAULT_MONTHS
    )
  })

  it('clamps out-of-range values into [1, 12]', () => {
    expect(normalizeProjectionMonths(-5)).toBe(1)
    expect(normalizeProjectionMonths(0)).toBe(1)
    expect(normalizeProjectionMonths(99)).toBe(12)
  })

  it('truncates decimals before clamping', () => {
    expect(normalizeProjectionMonths(3.8)).toBe(3)
    expect(normalizeProjectionMonths(12.9)).toBe(12)
  })
})
