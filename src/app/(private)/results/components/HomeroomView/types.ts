/** セルのデータ（事前計算済み） */
export interface CellData {
  subjectName?: string
  instructorText: string
  roomText: string
}

/** 学級ごとの時間割データ（事前計算済み） */
export interface HomeroomTimetableData {
  homeroomId: string
  homeroomName: string
  gradeName?: string
  /** cells[`${day}-${period}`] でアクセス */
  cells: Record<string, CellData>
}

/** ビュー全体の表示用データ */
export interface HomeroomViewData {
  homerooms: HomeroomTimetableData[]
  availableDays: Array<{ key: string; label: string }>
  periods: number[]
}

