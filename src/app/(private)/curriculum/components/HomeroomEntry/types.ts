/**
 * 学級編集コールバックの引数型
 */
export interface OnEditHomeroomData {
  homeroomId: string
}

/**
 * 講座追加コールバックの引数型
 */
export interface OnAddCourseData {
  laneId: string
  blockId: string
  gradeId: string | null
}

/**
 * 講座編集コールバックの引数型
 */
export interface OnEditCourseData {
  courseId: string
  courseName: string
  subjectId: string | null
  instructorIds: string[]
  laneId: string
  gradeId: string | null
}

/**
 * ブロック追加コールバックの引数型
 */
export interface OnAddBlockData {
  homeroomId: string
}
