/**
 * FastAPI最適化APIクライアント
 */

// FastAPI のベースURL（Docker内部通信）
const FASTAPI_BASE_URL = process.env.FASTAPI_URL || 'http://fastapi:8000'

export interface OptimizeAnnualTimetableInput {
  ttid: string
  annualData: AnnualData
  constraintDefinitions: ConstraintDefinition[]
}

export interface AnnualData {
  schoolDays: SchoolDay[]
  homerooms: Homeroom[]
  instructors: Instructor[]
  rooms: Room[]
  courses: Course[]
  curriculums: Curriculum[]
}

export interface SchoolDay {
  day: string
  available: boolean
  amPeriods?: number
  pmPeriods?: number
}

export interface Homeroom {
  id: string
  days: HomeroomDay[]
}

export interface HomeroomDay {
  day: string
  periods: number
}

export interface Instructor {
  id: string
  days: AttendanceDay[]
}

export interface AttendanceDay {
  day: string
  unavailablePeriods: number[]
}

export interface Room {
  id: string
}

export interface Course {
  id: string
  credits: number
  courseDetails: CourseDetail[]
}

export interface CourseDetail {
  instructorId: string
  roomId?: string
}

export interface Curriculum {
  homeroomId: string
  blocks: Block[]
}

export interface Block {
  id: string
  lanes: Lane[]
}

export interface Lane {
  courseIds: string[]
}

export interface ConstraintDefinition {
  constraintDefinitionCode: string
  softFlag: boolean
  penaltyWeight?: number
  parameters?: ConstraintParameter[]
}

export interface ConstraintParameter {
  key: string
  value: string
}

export interface OptimizationResult {
  entries: TimetableEntry[]
  violations: ConstraintViolation[]
}

export interface TimetableEntry {
  homeroom: string // ID
  day: string
  period: number
  course: string // ID
}

export interface ConstraintViolation {
  violation_code: string
  violation_keys: unknown[]
}

/**
 * FastAPI最適化APIを呼び出す
 */
export async function optimizeAnnualTimetable(
  input: OptimizeAnnualTimetableInput
): Promise<OptimizationResult> {
  try {
    const response = await fetch(
      `${FASTAPI_BASE_URL}/optimise-annual-timetable`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `FastAPI returned ${response.status}: ${response.statusText}. ${errorText}`
      )
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('FastAPI optimization error:', error)
    throw error
  }
}

/**
 * FastAPIの年次データ取得API（スタブ）を呼び出す
 */
export async function getAnnualData(ttid: string): Promise<AnnualData> {
  try {
    const response = await fetch(`${FASTAPI_BASE_URL}/annual-data/${ttid}`)

    if (!response.ok) {
      throw new Error(
        `FastAPI returned ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error('FastAPI annual data fetch error:', error)
    throw error
  }
}
