// UI/モーダル用の型定義
// UIコンポーネント間のデータ受け渡し用（entity/GraphQL/BFFでカバーできないもののみ）

import type { HomeroomDay, Subject, Instructor } from '@/core/domain/entity'

// 学級モーダルデータ
export interface HomeroomModalData {
  id: string | null
  homeroomName: string
  homeroomDays: HomeroomDay[]
  gradeId: string | null
}

// 講座モーダル用オプション
export interface CourseModalOptions {
  subjects: Subject[]
  instructors: Instructor[]
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
