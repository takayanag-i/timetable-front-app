// GraphQL型定義 - spring/schema.graphqlsと連動
// Server Actionsで使用するGraphQLのInput/Response型を定義
// 注意: このファイルは@/core/domain/entityを参照しない（依存関係の明確化のため）

// --------------------------------------
// GraphQL API用の基本型定義
// --------------------------------------

// GraphQL API用の学級曜日型
export interface GraphQLHomeroomDayType {
  id: string
  dayOfWeek: string
  periods: number
}

// GraphQL API用の学校曜日型
// GraphQLスキーマ: amPeriods/pmPeriodsはInt（nullable）のため optional かつ null を許可
export interface GraphQLSchoolDayType {
  id: string
  ttid: string
  dayOfWeek: string
  isAvailable: boolean
  amPeriods?: number | null
  pmPeriods?: number | null
}

// GraphQL API用の科目型
// GraphQLスキーマ: disciplineはDiscipline!（必須）、gradeはGrade（nullable）
export interface GraphQLSubjectType {
  id: string
  ttid: string
  discipline: {
    disciplineCode: string
    disciplineName: string
  }
  subjectName: string
  credits?: number | null
  grade?: {
    id: string
    ttid: string
    gradeName: string
  } | null
}

// GraphQL API用の教員型
// GraphQLスキーマ: attendanceDaysは[AttendanceDay!]!（必須配列）
export interface GraphQLInstructorType {
  id: string
  ttid: string
  instructorName: string
  disciplineCode: string
  attendanceDays: GraphQLAttendanceDayType[]
}

// GraphQL API用の勤怠曜日型
export interface GraphQLAttendanceDayType {
  id: string
  dayOfWeek: string
  unavailablePeriods: number[]
}

// GraphQL API用の教室型
export interface GraphQLRoomType {
  id: string
  ttid: string
  roomName: string
}

// GraphQL API用の制約定義型
export interface ConstraintDefinitionResponse {
  id: string
  ttid: string
  constraintDefinitionCode: string
  softFlag: boolean
  penaltyWeight?: number | null
  parameters?: unknown | null
}

// GraphQL API用の制約定義マスタ型
export interface ConstraintDefinitionMasterResponse {
  constraintDefinitionCode: string
  constraintDefinitionName: string
  description?: string | null
  mandatoryFlag: boolean
  softFlag: boolean
  parameterMasters: ConstraintParameterMasterResponse[]
}

// GraphQL API用の制約パラメータマスタ型
export interface ConstraintParameterMasterResponse {
  parameterKey: string
  parameterName: string
  arrayFlag: boolean
  optionList?: unknown | null
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
// TimetableResult Types (for GraphQL API)
// --------------------------------------

// 時間割結果エントリ（1コマ分の授業情報）
export interface TimetableResultEntryType {
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
export interface TimetableResultViolationType {
  id: string
  constraintViolationCode: string
  violatingKeys: unknown
}

// 時間割結果（最適化結果全体）
export interface TimetableResultType {
  id: string
  ttid: string
  timetableEntries: TimetableResultEntryType[]
  constraintViolations: TimetableResultViolationType[]
}

// --------------------------------------
// GraphQL型定義（最適化API用）
// --------------------------------------

// GraphQL学級型（最適化API用：name系フィールド不要）
export interface GraphQLHomeroomType {
  id: string
  homeroomDays: GraphQLHomeroomDayType[]
  blocks?: GraphQLBlockType[]
}

// GraphQL教員型（最適化API用：name系フィールド不要）
export interface GraphQLInstructorOptimizeType {
  id: string
  attendanceDays: GraphQLAttendanceDayType[]
}

// GraphQL教室型（最適化API用：name系フィールド不要、idのみ）
export interface GraphQLRoomOptimizeType {
  id: string
}

// GraphQL講座型（最適化API用：name系フィールド不要）
export interface GraphQLCourseType {
  id: string
  subject: {
    id: string
    credits?: number
  }
  courseDetails: GraphQLCourseDetailType[]
}

// GraphQL講座詳細型（最適化API用：name系フィールド不要）
export interface GraphQLCourseDetailType {
  id: string
  instructor: {
    id: string
  }
  room?: {
    id: string
  }
}

// GraphQLブロック型（最適化API用：name系フィールド不要）
export interface GraphQLBlockType {
  id: string
  lanes: GraphQLLaneType[]
}

// GraphQLレーン型（最適化API用：name系フィールド不要）
export interface GraphQLLaneType {
  id: string
  courses: {
    id: string
  }[]
}

// GraphQL科目型（最適化API用）
// subjectsから取得する場合、coursesにsubjectフィールドはない（親がsubjectのため）
export interface GraphQLSubjectOptimizeType {
  id: string
  credits?: number
  courses: Array<{
    id: string
    courseDetails: GraphQLCourseDetailType[]
  }>
}

// GraphQL年次データ型（最適化API用）
export interface GraphQLAnnualDataType {
  schoolDays: GraphQLSchoolDayType[]
  homerooms: GraphQLHomeroomType[]
  instructors: GraphQLInstructorOptimizeType[]
  rooms: GraphQLRoomOptimizeType[]
  subjects: GraphQLSubjectOptimizeType[]
}

// 注意: FastAPI用のConstraintDefinition型は @/lib/fastapi-client を参照すること
