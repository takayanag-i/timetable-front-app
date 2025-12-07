// UI/モーダル用の型定義
// UIコンポーネント間のデータ受け渡し用（entity/GraphQL/BFFでカバーできないもののみ）
// 注意: このファイルは@/core/domain/entityを参照しない（依存関係の明確化のため）

// UI用の学級曜日型
export interface UIHomeroomDayType {
  id: string
  dayOfWeek: string
  periods: number
}

// UI用の科目型
export interface UISubjectType {
  id: string
  subjectName: string
  credits?: number | null
  discipline?: {
    disciplineCode: string
    disciplineName: string
  }
  grade?: {
    id: string
    gradeName: string
    ttid?: string
  } | null
}

// UI用の教員型
export interface UIInstructorType {
  id: string
  instructorName: string
  disciplineCode: string
  attendanceDays?: {
    id: string
    dayOfWeek: string
    unavailablePeriods: number[]
  }[]
}

// 学級モーダルデータ
export interface HomeroomModalData {
  id: string | null
  homeroomName: string
  homeroomDays: UIHomeroomDayType[]
  gradeId: string | null
}

// 講座モーダル用オプション
export interface CourseModalOptions {
  subjects: UISubjectType[]
  instructors: UIInstructorType[]
  courses: {
    id: string
    courseName: string
    subjectId: string
    instructorIds: string[]
    instructorNames: string[]
  }[]
}

// CourseModal で扱うフォーム値
export interface CourseFormValues {
  subjectId: string
  courseName: string
  courseDetails: { instructorId: string }[]
}

// 制約定義モーダルで扱うフォーム値
export interface ConstraintDefinitionFormValues {
  constraintDefinitionCode: string
  softFlag: boolean
  penaltyWeight: string
  parameters: string
}
