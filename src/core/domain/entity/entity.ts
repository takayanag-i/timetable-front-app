// エンティティ

// --------------------------------------
// Instructor (教員)
// --------------------------------------
export interface Instructor {
  id: string
  instructorName: string
  disciplineCode: string
  attendanceDays?: AttendanceDay[] // Optional for simple lookups
}

export interface AttendanceDay {
  id: string
  dayOfWeek: string
  unavailablePeriods: number[]
}

// --------------------------------------
// Room (教室) - Simple lookup entity
// --------------------------------------
export interface Room {
  id: string
  roomName: string
}

// --------------------------------------
// Subject (科目)
// --------------------------------------
export interface Discipline {
  disciplineCode: string
  disciplineName: string
}

export interface Grade {
  id: string
  gradeName: string
  ttid?: string
}

export interface Subject {
  id: string
  discipline?: Discipline // Optional for simple lookups
  subjectName: string
  credits?: number | null // Optional for simple lookups
  grade?: Grade | null
}

// --------------------------------------
// Course (講座) - Aggregate Root
// --------------------------------------
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

// --------------------------------------
// Lane (レーン)
// --------------------------------------
export interface Lane {
  id: string
  courses: Course[]
}

// --------------------------------------
// Block (ブロック)
// --------------------------------------
export interface Block {
  id: string
  blockName: string
  lanes: Lane[]
}

// --------------------------------------
// Homeroom (学級) - Aggregate Root
// --------------------------------------
export interface HomeroomDay {
  id: string
  dayOfWeek: string
  periods: number
}

export interface Homeroom {
  id: string
  homeroomName: string
  homeroomDays: HomeroomDay[]
  blocks: Block[]
  grade?: Grade | null
}

// --------------------------------------
// SchoolDay (学校曜日) - Configuration Entity
// --------------------------------------
export interface SchoolDay {
  id: string
  dayOfWeek: string
  amPeriods: number
  pmPeriods: number
  isAvailable: boolean
}
