/**
 * FastAPI最適化APIクライアント
 */
import { logApiRequest, logApiResponse } from '@/lib/api-logger'

// FastAPI のベースURL（Docker内部通信）
const FASTAPI_BASE_URL = process.env.OPT_API_URL || 'http://fastapi:8000'

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
  const endpoint = `${FASTAPI_BASE_URL}/optimise-annual-timetable`

  try {
    // リクエストをログ出力
    logApiRequest(endpoint, 'POST', input)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const errorText = await response.text()
      // エラーレスポンスをログ出力
      logApiResponse(endpoint, response.status, errorText)
      throw new Error(
        `FastAPI returned ${response.status}: ${response.statusText}. ${errorText}`
      )
    }

    const result = await response.json()

    // 成功レスポンスをログ出力
    logApiResponse(endpoint, response.status, result)

    return result
  } catch (error) {
    console.error('FastAPI optimization error:', error)
    throw error
  }
}
