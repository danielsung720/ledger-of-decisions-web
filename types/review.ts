import type { Category, ConfidenceLevel, Intent } from './expense'

// ============================================================
// Statistics Types
// ============================================================

/** Category statistics */
export interface CategoryStats {
  category: Category
  category_label: string
  total_amount: number
  count: number
}

/** Intent statistics */
export interface IntentStats {
  intent: Intent
  intent_label: string
  total_amount: number
  count: number
}

/** Intent count statistics */
export interface IntentCountStats {
  intent: Intent
  intent_label: string
  count: number
  avg_confidence_score: number
  avg_confidence_level: ConfidenceLevel
}

/** Summary statistics */
export interface SummaryStats {
  total_amount: number
  total_count: number
  by_category: CategoryStats[]
  by_intent: IntentStats[]
  impulse_spending_ratio: number
}

/** Impulse spending trend */
export interface ImpulseSpendingTrend {
  this_week: number
  last_week: number
  change_percentage: number
  trend: 'up' | 'down' | 'stable'
}

/** High confidence intent */
export interface HighConfidenceIntent {
  intent: Intent
  intent_label: string
  count: number
}

/** Trends statistics */
export interface TrendsStats {
  impulse_spending: ImpulseSpendingTrend
  high_confidence_intents: HighConfidenceIntent[]
}

// ============================================================
// Review Page Types
// ============================================================

/** Date range for review */
export interface DateRange {
  startDate: string
  endDate: string
  preset?: 'today' | 'this_week' | 'this_month' | 'custom'
}

/** Review impulse trend view model */
export interface ImpulseTrendViewModel {
  thisWeek: number
  lastWeek: number
  changePercentage: number
  trend: 'up' | 'down' | 'stable'
}

/** Insight item */
export interface Insight {
  id: string
  type: 'success' | 'warning' | 'info' | 'alert'
  title: string
  description: string
  value?: string | number
}
