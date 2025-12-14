// GraphQL型定義 - Results関連

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
