// HomeroomModal 専用の型定義

/**
 * 学級曜日型（UI/Server Actions共通）
 */
export interface HomeroomDayType {
  id: string
  dayOfWeek: string
  periods: number
}

/**
 * 学級モーダルデータ
 */
export interface HomeroomModalData {
  id: string | null
  homeroomName: string
  homeroomDays: HomeroomDayType[]
  gradeId: string | null
}

/**
 * HomeroomModal で扱うフォーム値
 */
export interface HomeroomFormValues {
  id: string
  homeroomName: string
  homeroomDays: HomeroomDayType[]
  gradeId: string
}

/**
 * 学級データ（Server Actions用）
 */
export interface HomeroomData {
  homeroomName: string
  homeroomDays: HomeroomDayType[]
}
