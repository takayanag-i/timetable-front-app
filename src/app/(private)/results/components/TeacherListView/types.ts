/** セルのデータ（事前計算済み） */
export interface CellData {
  courseName: string
  homeroomText: string
  roomText: string
}

/** 教員ごとの時間割データ（事前計算済み） */
export interface TeacherRowData {
  instructorId: string
  instructorName: string
  /** cells[`${day}-${period}`] でアクセス */
  cells: Record<string, CellData>
}

/** 列ヘッダーのデータ */
export interface ColumnHeader {
  key: string
  label: string
}

/** ビュー全体の表示用データ */
export interface TeacherListViewData {
  teachers: TeacherRowData[]
  columnHeaders: ColumnHeader[]
}

