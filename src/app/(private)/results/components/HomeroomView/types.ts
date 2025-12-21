/** 列ヘッダ */
export interface ColumnHeader {
  key: string
  label: string
}

/** ビュー全体 */
export interface HomeroomViewData {
  homerooms: HomeroomTimetableData[]
  columnHeaders: ColumnHeader[]
  rowHeaders: number[]
}

/** 学級 */
export interface HomeroomTimetableData {
  homeroomId: string
  homeroomName: string
  gradeName?: string
  /** cells[`${day}-${period}`] でアクセス */
  cells: Record<string, CellData>
}

/** セル */
export interface CellData {
  subjectName?: string
  instructorText: string
  roomText: string
}
