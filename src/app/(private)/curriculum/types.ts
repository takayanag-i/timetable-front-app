// Curriculum機能で使用する型定義

// 学年型
export interface Grade {
  id: string
  gradeName: string
  ttid?: string
}

// 学校曜日型
export interface SchoolDay {
  id: string
  dayOfWeek: string
  amPeriods: number
  pmPeriods: number
  isAvailable: boolean
}

// 学級関連の型定義
export interface HomeroomDay {
  id: string
  dayOfWeek: string
  periods: number
}

export interface CourseDetail {
  id: string
  instructor: {
    id: string
    instructorName: string
    disciplineCode: string
  }
  room: {
    id: string
    roomName: string
  } | null
}

export interface Course {
  id: string
  courseName: string
  courseDetails: CourseDetail[]
  subject: {
    id: string
    subjectName: string
    credits: number | null
  } | null
}

export interface Lane {
  id: string
  courses: Course[]
}

export interface Block {
  id: string
  blockName: string
  lanes: Lane[]
}

// 学級編集用の型（blocksを含まない）
export interface HomeroomForEdit {
  id: string
  homeroomName: string
  homeroomDays: HomeroomDay[]
  grade: Grade | null
}

export interface Homeroom {
  id: string
  homeroomName: string
  homeroomDays: HomeroomDay[]
  blocks: Block[]
  grade: Grade | null
}
