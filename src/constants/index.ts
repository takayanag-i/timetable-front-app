// Common constants used across the application

// Days of the week (short form)
export const DAYS_OF_WEEK = ['月', '火', '水', '木', '金', '土', '日'] as const

/**
 * 曜日コードから日本語（短縮形）への変換マップ
 * 例: 'mon' -> '月'
 */
export const DAY_OF_WEEK_MAP: Record<string, string> = {
  mon: '月',
  tue: '火',
  wed: '水',
  thu: '木',
  fri: '金',
  sat: '土',
  sun: '日',
} as const

/**
 * 曜日コードから日本語（完全形）への変換マップ
 * 例: 'mon' -> '月曜日'
 */
export const DAY_OF_WEEK_FULL_MAP: Record<string, string> = {
  mon: '月曜日',
  tue: '火曜日',
  wed: '水曜日',
  thu: '木曜日',
  fri: '金曜日',
  sat: '土曜日',
  sun: '日曜日',
} as const

/**
 * 曜日選択用のオプションリスト（日曜日を除く）
 */
export const DAY_OF_WEEK_OPTIONS = [
  { value: 'mon', label: '月曜日' },
  { value: 'tue', label: '火曜日' },
  { value: 'wed', label: '水曜日' },
  { value: 'thu', label: '木曜日' },
  { value: 'fri', label: '金曜日' },
  { value: 'sat', label: '土曜日' },
] as const

/**
 * 曜日コードのリスト（日曜日を除く）
 */
export const DAY_OF_WEEK_CODES = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
] as const
