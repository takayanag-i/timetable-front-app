// UI/モーダル用の型定義
// UIコンポーネント間のデータ受け渡し用（entity/GraphQL/BFFでカバーできないもののみ）
// 注意: このファイルは@/core/domain/entityを参照しない（依存関係の明確化のため）

// UI用の学級曜日型
export interface UIHomeroomDayType {
  id: string
  dayOfWeek: string
  periods: number
}

// 学級モーダルデータ
export interface HomeroomModalData {
  id: string | null
  homeroomName: string
  homeroomDays: UIHomeroomDayType[]
  gradeId: string | null
}

// 制約定義モーダルで扱うフォーム値
export interface ConstraintDefinitionFormValues {
  constraintDefinitionCode: string
  softFlag: boolean
  penaltyWeight: string
  parameters: string
}

// BlockModal で扱うフォーム値
export interface BlockFormValues {
  blockName: string
  laneCount: number
  homeroomId: string
  blockId: string
}

// HomeroomModal で扱うフォーム値
export interface HomeroomFormValues {
  id: string
  homeroomName: string
  homeroomDays: UIHomeroomDayType[]
  gradeId: string
}
