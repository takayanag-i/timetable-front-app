// GraphQL型定義 - spring/schema.graphqlsと連動
// Server Actionsで使用するGraphQLのInput/Response型を定義

import type {
  HomeroomDay,
  SchoolDay,
  Subject,
  Instructor,
} from '@/core/domain/entity'

// --------------------------------------
// Query Response Types (for optimize API)
// --------------------------------------

// 学校曜日一覧のレスポンス型
export interface SchoolDaysResponse {
  schoolDays: SchoolDay[]
}

// 教員一覧のレスポンス型
export interface InstructorsResponse {
  instructors: Instructor[]
}

// 科目一覧のレスポンス型
export interface SubjectsResponse {
  subjects: Subject[]
}

// --------------------------------------
// Mutation Input Types (for Server Actions)
// --------------------------------------

// 学級作成更新 Input (UpsertHomeroomsInput)
export interface UpsertHomeroomsInput {
  ttid: string
  by: string
  homerooms: {
    id?: string
    homeroomName: string
    gradeId?: string
    homeroomDays: Array<
      Pick<HomeroomDay, 'dayOfWeek' | 'periods'> & { id?: string }
    >
  }[]
}
