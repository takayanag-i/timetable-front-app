import 'server-only'

import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { GET_TIMETABLE_RESULTS } from '@/lib/graphql/queries'

export interface TimetableResultEntry {
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

export interface TimetableResultViolation {
  id: string
  constraintViolationCode: string
  violatingKeys: unknown
}

export interface TimetableResult {
  id: string
  ttid: string
  timetableEntries: TimetableResultEntry[]
  constraintViolations: TimetableResultViolation[]
}

export async function getTimetableResult(
  resultId: string
): Promise<TimetableResult | null> {
  try {
    const result = await executeGraphQLForServerAction<{
      timetableResults: TimetableResult[]
    }>(
      {
        query: GET_TIMETABLE_RESULTS,
        variables: {
          input: {
            id: resultId,
          },
        },
      },
      'timetableResults'
    )

    if (!result.success || !result.data) {
      console.error(
        `時間割結果取得でエラーが発生しました: ${result.error || '不明なエラー'}`
      )
      return null
    }

    if (result.data.length === 0) {
      return null
    }

    return result.data[0]
  } catch (error) {
    console.error('時間割結果取得で不明なエラーが発生しました', error)
    return null
  }
}
