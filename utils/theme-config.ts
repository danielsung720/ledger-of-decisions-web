import type { ThemeId } from '~/stores/theme'

export interface ThemeOption {
  id: ThemeId
  name: string
  description: string
  previewColors: {
    bg: string
    surface: string
    border: string
    text: string
    textMuted: string
    primary: string
    primaryLight: string
  }
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    id: 'default',
    name: '預設風格',
    description: '溫暖療癒',
    previewColors: {
      bg: '#FFFBF7',
      surface: '#FFFFFF',
      border: '#F5E6D3',
      text: '#3D3833',
      textMuted: '#8C8279',
      primary: '#D98971',
      primaryLight: '#FDF5F2',
    },
  },
  {
    id: 'code',
    name: '程式碼風格',
    description: '專注效率',
    previewColors: {
      bg: '#1E1E2E',
      surface: '#2D2D3D',
      border: '#3D3D4D',
      text: '#E0E0E0',
      textMuted: '#888899',
      primary: '#61AFEF',
      primaryLight: '#2D3D4D',
    },
  },
  {
    id: 'ocean',
    name: '海洋清新風格',
    description: '清爽活力',
    previewColors: {
      bg: '#F0F8FF',
      surface: '#FFFFFF',
      border: '#B8D4E8',
      text: '#1B3A4B',
      textMuted: '#5D8AA8',
      primary: '#0077B6',
      primaryLight: '#E0F2FE',
    },
  },
] as const

export function getThemeOption(id: ThemeId): ThemeOption | undefined {
  return THEME_OPTIONS.find((theme) => theme.id === id)
}
