import { describe, it, expect } from 'vitest'
import {
  CATEGORY_OPTIONS,
  CATEGORY_MAP,
  INTENT_OPTIONS,
  INTENT_MAP,
  INTENT_COLORS,
  CONFIDENCE_OPTIONS,
  CONFIDENCE_MAP,
  DATE_RANGE_PRESETS,
  SORT_OPTIONS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  FREQUENCY_TYPE_OPTIONS,
  FREQUENCY_TYPE_MAP,
  DAY_OF_WEEK_OPTIONS,
  DAY_OF_WEEK_MAP,
  MONTH_OPTIONS,
} from '~/utils/constants'

describe('constants', () => {
  describe('CATEGORY_OPTIONS', () => {
    it('contains all 5 categories', () => {
      expect(CATEGORY_OPTIONS).toHaveLength(5)
    })

    it('has correct category values', () => {
      const values = CATEGORY_OPTIONS.map((c) => c.value)
      expect(values).toContain('food')
      expect(values).toContain('transport')
      expect(values).toContain('training')
      expect(values).toContain('living')
      expect(values).toContain('other')
    })

    it('has label and icon for each category', () => {
      CATEGORY_OPTIONS.forEach((cat) => {
        expect(cat.label).toBeTruthy()
        expect(cat.icon).toBeTruthy()
      })
    })
  })

  describe('CATEGORY_MAP', () => {
    it('maps all categories correctly', () => {
      expect(CATEGORY_MAP.food.label).toBe('飲食')
      expect(CATEGORY_MAP.transport.label).toBe('交通')
      expect(CATEGORY_MAP.training.label).toBe('學習/訓練')
      expect(CATEGORY_MAP.living.label).toBe('生活')
      expect(CATEGORY_MAP.other.label).toBe('其他')
    })
  })

  describe('INTENT_OPTIONS', () => {
    it('contains all 5 intents', () => {
      expect(INTENT_OPTIONS).toHaveLength(5)
    })

    it('has correct intent values', () => {
      const values = INTENT_OPTIONS.map((i) => i.value)
      expect(values).toContain('necessity')
      expect(values).toContain('efficiency')
      expect(values).toContain('enjoyment')
      expect(values).toContain('recovery')
      expect(values).toContain('impulse')
    })

    it('has all required fields for each intent', () => {
      INTENT_OPTIONS.forEach((intent) => {
        expect(intent.label).toBeTruthy()
        expect(intent.subLabel).toBeTruthy()
        expect(intent.icon).toBeTruthy()
        expect(intent.color).toBeTruthy()
        expect(intent.lightColor).toBeTruthy()
      })
    })
  })

  describe('INTENT_MAP', () => {
    it('maps all intents correctly', () => {
      expect(INTENT_MAP.necessity.label).toBe('必要')
      expect(INTENT_MAP.efficiency.label).toBe('效率')
      expect(INTENT_MAP.enjoyment.label).toBe('享受')
      expect(INTENT_MAP.recovery.label).toBe('恢復')
      expect(INTENT_MAP.impulse.label).toBe('衝動')
    })
  })

  describe('INTENT_COLORS', () => {
    it('has hex color for each intent', () => {
      expect(INTENT_COLORS.necessity).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(INTENT_COLORS.efficiency).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(INTENT_COLORS.enjoyment).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(INTENT_COLORS.recovery).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(INTENT_COLORS.impulse).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })

  describe('CONFIDENCE_OPTIONS', () => {
    it('contains all 3 confidence levels', () => {
      expect(CONFIDENCE_OPTIONS).toHaveLength(3)
    })

    it('has correct confidence values', () => {
      const values = CONFIDENCE_OPTIONS.map((c) => c.value)
      expect(values).toEqual(['high', 'medium', 'low'])
    })

    it('has all required fields for each level', () => {
      CONFIDENCE_OPTIONS.forEach((conf) => {
        expect(conf.label).toBeTruthy()
        expect(conf.icon).toBeTruthy()
        expect(conf.color).toBeTruthy()
        expect(conf.bgColor).toBeTruthy()
        expect(conf.borderColor).toBeTruthy()
      })
    })
  })

  describe('CONFIDENCE_MAP', () => {
    it('maps all confidence levels correctly', () => {
      expect(CONFIDENCE_MAP.high.label).toBe('很滿意')
      expect(CONFIDENCE_MAP.medium.label).toBe('還好')
      expect(CONFIDENCE_MAP.low.label).toBe('有點後悔')
    })
  })

  describe('DATE_RANGE_PRESETS', () => {
    it('contains all 4 presets', () => {
      expect(DATE_RANGE_PRESETS).toHaveLength(4)
    })

    it('has correct preset values', () => {
      const values = DATE_RANGE_PRESETS.map((p) => p.value)
      expect(values).toEqual(['today', 'this_week', 'this_month', 'custom'])
    })
  })

  describe('SORT_OPTIONS', () => {
    it('contains all 4 sort options', () => {
      expect(SORT_OPTIONS).toHaveLength(4)
    })

    it('has correct sort values', () => {
      const values = SORT_OPTIONS.map((s) => s.value)
      expect(values).toEqual(['date_desc', 'date_asc', 'amount_desc', 'amount_asc'])
    })
  })

  describe('PAGE_SIZE_OPTIONS', () => {
    it('has default page size of 15', () => {
      expect(DEFAULT_PAGE_SIZE).toBe(15)
    })

    it('contains valid page size options', () => {
      expect(PAGE_SIZE_OPTIONS).toEqual([10, 15, 20, 50])
    })

    it('includes default page size', () => {
      expect(PAGE_SIZE_OPTIONS).toContain(DEFAULT_PAGE_SIZE)
    })
  })

  describe('FREQUENCY_TYPE_OPTIONS', () => {
    it('contains all 4 frequency types', () => {
      expect(FREQUENCY_TYPE_OPTIONS).toHaveLength(4)
    })

    it('has correct frequency type values', () => {
      const values = FREQUENCY_TYPE_OPTIONS.map((f) => f.value)
      expect(values).toEqual(['daily', 'weekly', 'monthly', 'yearly'])
    })

    it('has label and icon for each type', () => {
      FREQUENCY_TYPE_OPTIONS.forEach((freq) => {
        expect(freq.label).toBeTruthy()
        expect(freq.icon).toBeTruthy()
      })
    })
  })

  describe('FREQUENCY_TYPE_MAP', () => {
    it('maps all frequency types correctly', () => {
      expect(FREQUENCY_TYPE_MAP.daily.label).toBe('每日')
      expect(FREQUENCY_TYPE_MAP.weekly.label).toBe('每週')
      expect(FREQUENCY_TYPE_MAP.monthly.label).toBe('每月')
      expect(FREQUENCY_TYPE_MAP.yearly.label).toBe('每年')
    })
  })

  describe('DAY_OF_WEEK_OPTIONS', () => {
    it('contains all 7 days', () => {
      expect(DAY_OF_WEEK_OPTIONS).toHaveLength(7)
    })

    it('has correct day values 0-6', () => {
      const values = DAY_OF_WEEK_OPTIONS.map((d) => d.value)
      expect(values).toEqual([0, 1, 2, 3, 4, 5, 6])
    })

    it('has both label and shortLabel for each day', () => {
      DAY_OF_WEEK_OPTIONS.forEach((day) => {
        expect(day.label).toBeTruthy()
        expect(day.shortLabel).toBeTruthy()
      })
    })
  })

  describe('DAY_OF_WEEK_MAP', () => {
    it('maps all days correctly', () => {
      expect(DAY_OF_WEEK_MAP[0].label).toBe('週日')
      expect(DAY_OF_WEEK_MAP[1].label).toBe('週一')
      expect(DAY_OF_WEEK_MAP[6].label).toBe('週六')
    })
  })

  describe('MONTH_OPTIONS', () => {
    it('contains all 12 months', () => {
      expect(MONTH_OPTIONS).toHaveLength(12)
    })

    it('has correct month values 1-12', () => {
      const values = MONTH_OPTIONS.map((m) => m.value)
      expect(values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    })

    it('has Chinese labels for each month', () => {
      expect(MONTH_OPTIONS[0].label).toBe('一月')
      expect(MONTH_OPTIONS[5].label).toBe('六月')
      expect(MONTH_OPTIONS[11].label).toBe('十二月')
    })
  })
})
