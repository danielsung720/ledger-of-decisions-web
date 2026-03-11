import type { IconKey } from '~/types/icon'

export interface IconNode {
  tag: 'path' | 'line' | 'circle' | 'polyline' | 'rect'
  attrs: Record<string, string | number>
}

export const ICON_MAP: Record<IconKey, IconNode[]> = {
  home: [
    { tag: 'path', attrs: { d: 'M3 10.5 12 3l9 7.5' } },
    { tag: 'path', attrs: { d: 'M5 10v10h14V10' } },
  ],
  'clipboard-list': [
    { tag: 'rect', attrs: { x: 6, y: 4, width: 12, height: 16, rx: 2 } },
    { tag: 'path', attrs: { d: 'M9 4.5h6M9 10h6M9 14h6' } },
  ],
  repeat: [
    { tag: 'path', attrs: { d: 'M17 2l4 4-4 4' } },
    { tag: 'path', attrs: { d: 'M3 11V9a3 3 0 0 1 3-3h15' } },
    { tag: 'path', attrs: { d: 'M7 22l-4-4 4-4' } },
    { tag: 'path', attrs: { d: 'M21 13v2a3 3 0 0 1-3 3H3' } },
  ],
  cash: [
    { tag: 'rect', attrs: { x: 3, y: 6, width: 18, height: 12, rx: 2 } },
    { tag: 'circle', attrs: { cx: 12, cy: 12, r: 3 } },
    { tag: 'path', attrs: { d: 'M7 12h.01M17 12h.01' } },
  ],
  'chart-bar': [{ tag: 'path', attrs: { d: 'M4 20V10M10 20V4M16 20v-7M22 20v-3' } }],
  notebook: [
    { tag: 'rect', attrs: { x: 5, y: 3, width: 14, height: 18, rx: 2 } },
    { tag: 'path', attrs: { d: 'M9 3v18M13 8h3M13 12h3' } },
  ],
  inbox: [
    { tag: 'path', attrs: { d: 'M3 12h5l2 3h4l2-3h5' } },
    { tag: 'path', attrs: { d: 'M5 12V6h14v6' } },
    { tag: 'path', attrs: { d: 'M4 12v6h16v-6' } },
  ],
  notes: [
    { tag: 'rect', attrs: { x: 4, y: 3, width: 16, height: 18, rx: 2 } },
    { tag: 'path', attrs: { d: 'M8 8h8M8 12h8M8 16h5' } },
  ],
  package: [
    { tag: 'path', attrs: { d: 'M3 7l9-4 9 4-9 4-9-4Z' } },
    { tag: 'path', attrs: { d: 'M3 7v10l9 4 9-4V7' } },
    { tag: 'path', attrs: { d: 'M12 11v10' } },
  ],
  'circle-check': [
    { tag: 'circle', attrs: { cx: 12, cy: 12, r: 9 } },
    { tag: 'path', attrs: { d: 'm8 12 2.5 2.5L16 9' } },
  ],
  bolt: [{ tag: 'path', attrs: { d: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z' } }],
  sparkles: [
    { tag: 'path', attrs: { d: 'M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3Z' } },
    { tag: 'path', attrs: { d: 'M5 14l.8 1.9L7.7 17l-1.9.8L5 19.7l-.8-1.9L2.3 17l1.9-.8L5 14Z' } },
    {
      tag: 'path',
      attrs: { d: 'M19 13l.8 1.9L21.7 16l-1.9.8L19 18.7l-.8-1.9L16.3 16l1.9-.8L19 13Z' },
    },
  ],
  leaf: [
    { tag: 'path', attrs: { d: 'M5 18c8 0 14-6 14-14-8 0-14 6-14 14Z' } },
    { tag: 'path', attrs: { d: 'M5 18c0-6 3-10 8-13' } },
  ],
  comet: [
    { tag: 'path', attrs: { d: 'M12 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z' } },
    { tag: 'path', attrs: { d: 'M3 8h5M2 12h4M4 16h3M15 5l2-2M18 8l3-1' } },
  ],
  'mood-smile': [
    { tag: 'circle', attrs: { cx: 12, cy: 12, r: 9 } },
    { tag: 'path', attrs: { d: 'M9 14c1 .8 2 .8 3 .8s2 0 3-.8' } },
    { tag: 'path', attrs: { d: 'M9 10h.01M15 10h.01' } },
  ],
  'mood-neutral': [
    { tag: 'circle', attrs: { cx: 12, cy: 12, r: 9 } },
    { tag: 'path', attrs: { d: 'M9 15h6M9 10h.01M15 10h.01' } },
  ],
  'mood-sad': [
    { tag: 'circle', attrs: { cx: 12, cy: 12, r: 9 } },
    { tag: 'path', attrs: { d: 'M9 16c1-.8 2-.8 3-.8s2 0 3 .8' } },
    { tag: 'path', attrs: { d: 'M9 10h.01M15 10h.01' } },
  ],
  key: [
    { tag: 'circle', attrs: { cx: 8, cy: 10, r: 3 } },
    { tag: 'path', attrs: { d: 'M11 10h10M17 10v3M20 10v2' } },
  ],
  lock: [
    { tag: 'rect', attrs: { x: 5, y: 11, width: 14, height: 10, rx: 2 } },
    { tag: 'path', attrs: { d: 'M8 11V8a4 4 0 0 1 8 0v3' } },
  ],
  mail: [
    { tag: 'rect', attrs: { x: 3, y: 5, width: 18, height: 14, rx: 2 } },
    { tag: 'path', attrs: { d: 'm3 7 9 6 9-6' } },
  ],
  utensils: [
    { tag: 'path', attrs: { d: 'M6 3v8M8 3v8M10 3v8M8 11v10' } },
    { tag: 'path', attrs: { d: 'M15 3v7a3 3 0 0 0 3 3h0V3' } },
  ],
  car: [
    { tag: 'path', attrs: { d: 'M4 14h16l-1-5a2 2 0 0 0-2-1H7a2 2 0 0 0-2 1l-1 5Z' } },
    { tag: 'circle', attrs: { cx: 7, cy: 16, r: 1.5 } },
    { tag: 'circle', attrs: { cx: 17, cy: 16, r: 1.5 } },
  ],
  barbell: [{ tag: 'path', attrs: { d: 'M3 10v4M6 9v6M18 9v6M21 10v4M6 12h12' } }],
  calendar: [
    { tag: 'rect', attrs: { x: 3, y: 5, width: 18, height: 16, rx: 2 } },
    { tag: 'path', attrs: { d: 'M8 3v4M16 3v4M3 9h18' } },
  ],
  'calendar-week': [
    { tag: 'rect', attrs: { x: 3, y: 5, width: 18, height: 16, rx: 2 } },
    { tag: 'path', attrs: { d: 'M8 3v4M16 3v4M3 9h18M8 13h8M8 17h5' } },
  ],
  'calendar-month': [
    { tag: 'rect', attrs: { x: 3, y: 5, width: 18, height: 16, rx: 2 } },
    {
      tag: 'path',
      attrs: { d: 'M8 3v4M16 3v4M3 9h18M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2M15 17h2' },
    },
  ],
  pin: [
    { tag: 'path', attrs: { d: 'M8 3h8l-2 6 3 3H7l3-3-2-6Z' } },
    { tag: 'path', attrs: { d: 'M12 12v9' } },
  ],
  sun: [
    { tag: 'circle', attrs: { cx: 12, cy: 12, r: 4 } },
    {
      tag: 'path',
      attrs: {
        d: 'M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1',
      },
    },
  ],
  'help-circle': [
    { tag: 'circle', attrs: { cx: 12, cy: 12, r: 9 } },
    { tag: 'path', attrs: { d: 'M9.5 9a2.5 2.5 0 1 1 4 2c-.9.6-1.5 1.3-1.5 2' } },
    { tag: 'path', attrs: { d: 'M12 17h.01' } },
  ],
}
