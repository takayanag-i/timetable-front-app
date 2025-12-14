/** セルのデータ（事前計算済み） */
export interface CellData {
  courseName: string
  homeroomText: string
  roomText: string
}

/** 教員ごとの時間割データ（事前計算済み） */
export interface TeacherTimetableData {
  instructorId: string
  instructorName: string
  /** cells[`${day}-${period}`] でアクセス */
  cells: Record<string, CellData>
}

/** ビュー全体の表示用データ */
export interface TeacherViewData {
  teachers: TeacherTimetableData[]
  availableDays: Array<{ key: string; label: string }>
  periods: number[]
}

