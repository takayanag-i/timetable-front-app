/** セルのデータ（事前計算済み） */
export interface CellData {
  courseName: string
  homeroomText: string
  roomText: string
}

/** 列ヘッダ */
export interface ColumnHeader {
  key: string
  label: string
}

/** 教員ごとの時間割データ（事前計算済み） */
export interface InstructorTimetableData {
  instructorId: string
  instructorName: string
  /** cells[`${day}-${period}`] でアクセス */
  cells: Record<string, CellData>
}

/** ビュー全体の表示用データ */
export interface InstructorViewData {
  instructors: InstructorTimetableData[]
  columnHeaders: ColumnHeader[]
  rowHeaders: number[]
}
