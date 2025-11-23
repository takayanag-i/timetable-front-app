// BFF API固有の型定義
// Server Actions用の型（GraphQLでカバーできないもののみ）

import type { HomeroomDay } from '@/core/domain/entity'

// 学級データ（Server Actions用）
export interface HomeroomData {
  homeroomName: string
  homeroomDays: HomeroomDay[]
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
