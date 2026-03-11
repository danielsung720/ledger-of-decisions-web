import type { HighConfidenceIntent, ImpulseTrendViewModel, Insight } from '~/types'

interface BuildReviewInsightsParams {
  impulseRatio: number
  impulseTrend?: ImpulseTrendViewModel
  highConfidenceIntents: HighConfidenceIntent[]
}

export function buildReviewInsights(params: BuildReviewInsightsParams): Insight[] {
  const result: Insight[] = []

  if (params.impulseRatio > 20) {
    result.push({
      id: 'high-impulse-warning',
      type: 'warning',
      title: '衝動消費偏高',
      description: '你的衝動消費佔比超過 20%，建議在消費前多思考一下。',
      value: `${params.impulseRatio.toFixed(1)}%`,
    })
  } else if (params.impulseRatio < 10) {
    result.push({
      id: 'low-impulse-success',
      type: 'success',
      title: '衝動消費控制得很好',
      description: '你的衝動消費佔比低於 10%，繼續保持！',
      value: `${params.impulseRatio.toFixed(1)}%`,
    })
  }

  if (params.impulseTrend?.trend === 'down') {
    result.push({
      id: 'impulse-trend-down',
      type: 'success',
      title: '衝動消費趨勢向下',
      description: '相較上週，你的衝動消費正在減少，做得好！',
    })
  }

  if (params.highConfidenceIntents.length > 0) {
    const topIntent = params.highConfidenceIntents[0]
    result.push({
      id: 'top-high-confidence-intent',
      type: 'info',
      title: `最常見的高信心決策：${topIntent?.intent_label ?? '無'}`,
      description: '這是你最確定的消費類型，表示你對這類消費有清晰的認知。',
      value: `${topIntent?.count ?? 0} 筆`,
    })
  }

  if (result.length === 0) {
    result.push({
      id: 'keep-tracking-spending',
      type: 'info',
      title: '持續記錄你的消費',
      description: '累積更多數據後，這裡會顯示更多個人化的洞察。',
    })
  }

  return result
}
