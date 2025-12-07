// GraphQL型定義 - spring/schema.graphqlsと連動
// Server Actionsで使用するGraphQLのInput/Response型を定義

import type {
  HomeroomDay,
  SchoolDay,
  Subject,
  Instructor,
  AttendanceDay,
  Room,
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
    homeroomDays: Array<{
      id?: string
      dayOfWeek: string
      periods: number
    }>
  }[]
}

// --------------------------------------
// ConstraintDefinition Types (for GraphQL API)
// --------------------------------------

// 制約定義 GraphQLレスポンス型
export interface ConstraintDefinitionResponse {
  id: string
  ttid: string
  constraintDefinitionCode: string
  softFlag: boolean
  penaltyWeight?: number | null
  parameters?: unknown | null
}

// 制約定義一覧のレスポンス型
export interface ConstraintDefinitionsResponse {
  constraintDefinitions: ConstraintDefinitionResponse[]
}

// --------------------------------------
// ConstraintDefinitionMaster Types (for GraphQL API)
// --------------------------------------

// 制約定義マスタ GraphQLレスポンス型
export interface ConstraintDefinitionMasterResponse {
  constraintDefinitionCode: string
  constraintDefinitionName: string
  description?: string | null
  mandatoryFlag: boolean
  softFlag: boolean
  parameterMasters: ConstraintParameterMasterResponse[]
}

// 制約定義マスタ一覧のレスポンス型
export interface ConstraintDefinitionMastersResponse {
  constraintDefinitionMasters: ConstraintDefinitionMasterResponse[]
}

// --------------------------------------
// ConstraintParameterMaster Types (for GraphQL API)
// --------------------------------------

// 制約パラメータマスタ GraphQLレスポンス型
export interface ConstraintParameterMasterResponse {
  parameterKey: string
  parameterName: string
  arrayFlag: boolean
  optionList?: unknown | null
}

// 制約パラメータマスタ一覧のレスポンス型
export interface ConstraintParameterMastersResponse {
  constraintParameterMasters: ConstraintParameterMasterResponse[]
}

// --------------------------------------
// TimetableResult Types (for GraphQL API)
// --------------------------------------

// 時間割結果エントリ（1コマ分の授業情報）
export interface TimetableResultEntry {
  id: string
  homeroom: {
    id: string
    homeroomName: string
    grade?: {
      id: string
      gradeName: string
    }
  }
  dayOfWeek: string
  period: number
  course: {
    id: string
    courseName: string
    subject?: {
      id: string
      subjectName: string
    }
    courseDetails?: Array<{
      instructor?: {
        id: string
        instructorName: string
      }
      room?: {
        id: string
        roomName: string
      }
    }>
  }
}

// 時間割結果の制約違反情報
export interface TimetableResultViolation {
  id: string
  constraintViolationCode: string
  violatingKeys: unknown
}

// 時間割結果（最適化結果全体）
export interface TimetableResult {
  id: string
  ttid: string
  timetableEntries: TimetableResultEntry[]
  constraintViolations: TimetableResultViolation[]
}

// --------------------------------------
// GraphQL型定義（最適化API用）
// --------------------------------------

// GraphQL学校曜日型（amPeriods/pmPeriodsはオプショナル）
export interface GraphQLSchoolDay {
  id: string
  dayOfWeek: string
  isAvailable: boolean
  amPeriods?: number
  pmPeriods?: number
}

// GraphQL学級型（最適化API用：name系フィールド不要）
export interface GraphQLHomeroom {
  id: string
  homeroomDays: HomeroomDay[]
  blocks?: GraphQLBlock[]
}

// GraphQL教員型（最適化API用：name系フィールド不要）
export interface GraphQLInstructor {
  id: string
  attendanceDays: AttendanceDay[]
}

// GraphQL教室型（最適化API用：name系フィールド不要、idのみ）
export interface GraphQLRoom {
  id: string
}

// GraphQL講座型（最適化API用：name系フィールド不要）
export interface GraphQLCourse {
  id: string
  subject: {
    id: string
    credits?: number
  }
  courseDetails: GraphQLCourseDetail[]
}

// GraphQL講座詳細型（最適化API用：name系フィールド不要）
export interface GraphQLCourseDetail {
  id: string
  instructor: {
    id: string
  }
  room?: {
    id: string
  }
}

// GraphQLブロック型（最適化API用：name系フィールド不要）
export interface GraphQLBlock {
  id: string
  lanes: GraphQLLane[]
}

// GraphQLレーン型（最適化API用：name系フィールド不要）
export interface GraphQLLane {
  id: string
  courses: {
    id: string
  }[]
}

// GraphQL科目型（最適化API用）
// subjectsから取得する場合、coursesにsubjectフィールドはない（親がsubjectのため）
export interface GraphQLSubject {
  id: string
  credits?: number
  courses: Array<{
    id: string
    courseDetails: GraphQLCourseDetail[]
  }>
}

// GraphQL年次データ型（最適化API用）
export interface GraphQLAnnualData {
  schoolDays: GraphQLSchoolDay[]
  homerooms: GraphQLHomeroom[]
  instructors: GraphQLInstructor[]
  rooms: GraphQLRoom[]
  subjects: GraphQLSubject[]
}

// 制約定義（FastAPI変換用）
export interface ConstraintDefinition {
  constraintDefinitionCode: string
  softFlag: boolean
  penaltyWeight?: number
  parameters?: Array<{
    key: string
    value: string
  }>
}
