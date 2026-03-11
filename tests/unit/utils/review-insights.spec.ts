import { describe, expect, it } from 'vitest'
import { buildReviewInsights } from '~/utils/review-insights'

describe('buildReviewInsights', () => {
  it('returns high impulse warning when impulse ratio is above threshold', () => {
    const insights = buildReviewInsights({
      impulseRatio: 25,
      impulseTrend: undefined,
      highConfidenceIntents: [],
    })

    expect(insights.some((item) => item.id === 'high-impulse-warning')).toBe(true)
  })

  it('returns low impulse success when impulse ratio is below threshold', () => {
    const insights = buildReviewInsights({
      impulseRatio: 9.9,
      impulseTrend: undefined,
      highConfidenceIntents: [],
    })

    expect(insights.some((item) => item.id === 'low-impulse-success')).toBe(true)
  })

  it('returns trend and top high-confidence insights when data exists', () => {
    const insights = buildReviewInsights({
      impulseRatio: 12,
      impulseTrend: {
        thisWeek: 120,
        lastWeek: 150,
        changePercentage: -20,
        trend: 'down',
      },
      highConfidenceIntents: [{ intent: 'necessity', intent_label: '必要', count: 3 }],
    })

    expect(insights.some((item) => item.id === 'impulse-trend-down')).toBe(true)
    expect(insights.some((item) => item.id === 'top-high-confidence-intent')).toBe(true)
  })

  it('returns fallback insight when no rule matches', () => {
    const insights = buildReviewInsights({
      impulseRatio: 12,
      impulseTrend: undefined,
      highConfidenceIntents: [],
    })

    expect(insights).toHaveLength(1)
    expect(insights[0]?.id).toBe('keep-tracking-spending')
  })
})
