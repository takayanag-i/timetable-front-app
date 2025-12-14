// GraphQL型定義 - Optimize API関連

// GraphQL API用の学級曜日型（最適化API用）
interface GraphQLHomeroomDayType {
  id: string
  dayOfWeek: string
  periods: number
}

// GraphQL API用の勤怠曜日型（最適化API用）
interface GraphQLAttendanceDayType {
  id: string
  dayOfWeek: string
  unavailablePeriods: number[]
}

// GraphQL API用の学校曜日型
export interface GraphQLSchoolDayType {
  id: string
  ttid: string
  dayOfWeek: string
  isAvailable: boolean
  amPeriods?: number | null
  pmPeriods?: number | null
}

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
