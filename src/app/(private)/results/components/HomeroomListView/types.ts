/** セルのデータ（事前計算済み） */
export interface CellData {
  courseName: string
  instructorText: string
  roomText: string
}

/** 学級ごとの時間割データ（事前計算済み） */
export interface HomeroomRowData {
  homeroomId: string
  homeroomName: string
  gradeName?: string
  /** cells[`${day}-${period}`] でアクセス */
  cells: Record<string, CellData>
}

/** 列ヘッダーのデータ */
export interface ColumnHeader {
  key: string
  label: string
}

/** ビュー全体の表示用データ */
export interface HomeroomListViewData {
  homerooms: HomeroomRowData[]
  columnHeaders: ColumnHeader[]
}
