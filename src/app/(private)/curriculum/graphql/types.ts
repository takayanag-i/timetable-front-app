// GraphQL型定義 - Curriculum関連

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
