// Server Actions用の型定義

import type { ErrorCode } from '@/lib/errors'

// Server Actions用の統一された戻り値型
export type ActionResult<T = unknown> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
      errorCode?: ErrorCode
    }
