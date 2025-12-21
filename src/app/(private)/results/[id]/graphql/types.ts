// 時間割結果画面用レスポンス
export interface TimetableResultUiQueryResponse {
  timetableResults: TimetableResultQueryResponse[]
  schoolDays: SchoolDayQueryResponse[]
}

// 時間割結果
export interface TimetableResultQueryResponse {
  id: string
  ttid: string
  timetableEntries: TimetableEntryQueryResponse[]
  constraintViolations: ConstraintViolationQueryResponse[]
}

// 時間割エントリ
export interface TimetableEntryQueryResponse {
  id: string
  homeroom: {
    id: string
    homeroomName: string
    grade: {
      id: string
      gradeName: string
    }
  }
  dayOfWeek: string
  period: number
  course: {
    id: string
    courseName: string
    subject: {
      id: string
      subjectName: string
    }
    courseDetails: Array<{
      instructor: {
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

// 制約違反
export interface ConstraintViolationQueryResponse {
  id: string
  constraintViolationCode: string
  violatingKeys: unknown
}

// 学校曜日
export interface SchoolDayQueryResponse {
  id: string
  ttid: string
  dayOfWeek: string
  isAvailable: boolean
  amPeriods?: number | null
  pmPeriods?: number | null
}
