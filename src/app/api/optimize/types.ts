// 最適化API Route用の型定義
// 注意: このファイルは@/core/domain/entityを参照しない（依存関係の明確化のため）

// 最適化APIリクエスト
export interface OptimizeRequest {
  ttid: string
}

// 最適化API実行結果
export interface OptimizeResult {
  success: boolean
  data?: unknown
  timetableResultId?: string
  error?: string
  details?: unknown
}
