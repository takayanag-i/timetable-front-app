import 'server-only'

import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { GET_TIMETABLE_RESULTS } from '@/app/(private)/results/[id]/graphql/queries'
import type {
  TimetableResultQueryResponse,
  TimetableResultUiQueryResponse,
  SchoolDayQueryResponse,
} from '@/app/(private)/results/[id]/graphql/types'
import { logger } from '@/lib/logger'

/**
 * 時間割結果詳細を取得する（学校曜日も含む）
 *
 * @param resultId - 時間割結果ID
 * @returns 時間割結果詳細と学校曜日
 */
export async function getTimetableResult(resultId: string): Promise<{
  timetableResult: TimetableResultQueryResponse
  schoolDays: SchoolDayQueryResponse[]
} | null> {
  try {
    const ttid = getDefaultTtid()
    const result =
      await executeGraphQLForServerAction<TimetableResultUiQueryResponse>(
        {
          query: GET_TIMETABLE_RESULTS,
          variables: {
            input: {
              id: resultId,
              ttid,
            },
            schoolDaysInput: {
              ttid,
            },
          },
        },
        undefined // 複数フィールドを取得するため、dataFieldNameは指定しない
      )

    if (!result.success || !result.data) {
      logger.error('時間割結果取得でエラーが発生しました', {
        error: result.error || '不明なエラー',
      })
      return null
    }

    if (result.data.timetableResults.length === 0) {
      return null
    }

    return {
      timetableResult: result.data.timetableResults[0],
      schoolDays: result.data.schoolDays,
    }
  } catch (error) {
    logger.error('時間割結果取得で不明なエラーが発生しました', {
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}
