// Curriculum機能で使用する型定義

// 学年型
export interface Grade {
  id: string
  gradeName: string
  ttid?: string
}

// 教科型
export interface Discipline {
  disciplineCode: string
  disciplineName: string
}

// 科目型
export interface Subject {
  id: string
  subjectName: string
  discipline?: Discipline
  credits?: number | null
  grade?: Grade | null
}

// 教員型
export interface Instructor {
  id: string
  instructorName: string
}

// 教室型
export interface Room {
  id: string
  roomName: string
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
  instructor: Instructor
  room: Room | null
}

export interface Course {
  id: string
  courseName: string
  courseDetails: CourseDetail[]
  subject?: Subject | null
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
