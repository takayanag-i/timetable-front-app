// Server Actions用の型定義
// 注意: このファイルは@/core/domain/entityを参照しない（依存関係の明確化のため）

// Server Actions用の学級曜日型
export interface ServerActionHomeroomDayType {
  id: string
  dayOfWeek: string
  periods: number
}

// 学級データ（Server Actions用）
export interface HomeroomData {
  homeroomName: string
  homeroomDays: ServerActionHomeroomDayType[]
}

// Server Actions用の統一された戻り値型
export type ActionResult<T = unknown> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }
