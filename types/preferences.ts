/**
 * User Preferences types
 */

export type ThemeId = 'default' | 'code' | 'ocean'

export interface UserPreferences {
  ui_theme: ThemeId
}

export interface UpdateUserPreferencesRequest {
  ui_theme: ThemeId
}
