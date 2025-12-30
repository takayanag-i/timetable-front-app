// GraphQL型定義 - Curriculum関連
// 共通型（@/types/graphql-types）を再エクスポート

import type {
  GraphQLSchoolDay,
  GraphQLAttendanceDay,
  GraphQLInstructor,
  GraphQLRoom,
  GraphQLDiscipline,
  GraphQLGrade,
  GraphQLSubject,
  GraphQLHomeroomDay,
  GraphQLHomeroom,
  GraphQLBlock,
  GraphQLLane,
  GraphQLCourseDetail,
  GraphQLCourse,
} from '@/types/graphql-types'

export type {
  GraphQLSchoolDay,
  GraphQLAttendanceDay,
  GraphQLInstructor,
  GraphQLRoom,
  GraphQLDiscipline,
  GraphQLGrade,
  GraphQLSubject,
  GraphQLHomeroomDay,
  GraphQLHomeroom,
  GraphQLBlock,
  GraphQLLane,
  GraphQLCourseDetail,
  GraphQLCourse,
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
    homeroomDays: Array<{
      id?: string
      dayOfWeek: string
      periods: number
    }>
  }[]
}

// 学級・学年一覧取得用の複合レスポンス型（GraphQL型）
export interface HomeroomsAndGradesResponse {
  homerooms?: GraphQLHomeroom[]
  grades?: GraphQLGrade[]
}

// 講座モーダルオプション取得用の複合レスポンス型（GraphQL型）
export interface CourseModalOptionsResponse {
  subjects?: GraphQLSubject[]
  instructors?: GraphQLInstructor[]
  courses?: GraphQLCourse[]
}
