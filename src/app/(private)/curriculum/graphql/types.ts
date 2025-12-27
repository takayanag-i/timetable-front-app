// GraphQL型定義 - Curriculum関連

// GraphQL API用の学級編集用型（最小限のフィールド）
export interface GraphQLHomeroomForEditType {
  id: string
  homeroomName: string
  grade?: {
    id: string
    gradeName: string
  } | null
  homeroomDays: GraphQLHomeroomDayType[]
}

// GraphQL API用の学級型
export interface GraphQLHomeroomType {
  id: string
  homeroomName: string
  grade?: {
    id: string
    gradeName: string
  } | null
  homeroomDays: GraphQLHomeroomDayType[]
  blocks: Array<{
    id: string
    blockName: string
    lanes: Array<{
      id: string
      courses: Array<{
        id: string
        courseName: string
        subject?: {
          id: string
          subjectName: string
          credits?: number | null
        } | null
        courseDetails: Array<{
          id: string
          instructor?: {
            id: string
            instructorName: string
          } | null
          room?: {
            id: string
            roomName: string
          } | null
        }>
      }>
    }>
  }>
}

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

// 講座モーダルオプション取得用の複合レスポンス型（GraphQL型）
export interface CourseModalOptionsResponse {
  subjects: GraphQLSubjectType[]
  instructors: GraphQLInstructorType[]
  courses: Array<{
    id: string
    courseName: string
    courseDetails: Array<{
      instructor?: {
        id: string
        instructorName: string
      } | null
    }>
    subject?: {
      id: string
      subjectName: string | null
      grade?: { id: string; gradeName: string }
      discipline?: { disciplineCode: string; disciplineName: string }
    }
  }>
}
