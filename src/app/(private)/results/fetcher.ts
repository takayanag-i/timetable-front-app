import 'server-only'

import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import {
  GET_TIMETABLE_RESULTS,
  GET_TIMETABLE_RESULTS_LIST,
} from '@/app/(private)/results/graphql/queries'
import type {
  TimetableResultQueryResponse,
  TimetableResultListQueryResponse,
  TimetableResultWithSchoolDaysResponse,
  SchoolDayQueryResponse,
} from '@/app/(private)/results/graphql/types'
import { logger } from '@/lib/logger'

/**
 * 時間割結果一覧を取得する
 *
 * @returns 時間割結果一覧
 */
export async function getTimetableResultsList(): Promise<
  TimetableResultListQueryResponse[]
> {
  try {
    const ttid = getDefaultTtid()
    const result = await executeGraphQLForServerAction<
      TimetableResultListQueryResponse[]
    >(
      {
        query: GET_TIMETABLE_RESULTS_LIST,
        variables: {
          input: {
            ttid,
          },
        },
      },
      'timetableResults'
    )

    if (!result.success || !result.data) {
      logger.error('時間割結果一覧取得でエラーが発生しました', {
        error: result.error,
      })
      return []
    }

    return result.data
  } catch (error) {
    logger.error('時間割結果一覧取得で不明なエラーが発生しました', {
      error: error instanceof Error ? error.message : String(error),
    })
    return []
  }
}

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
      await executeGraphQLForServerAction<TimetableResultWithSchoolDaysResponse>(
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
      console.error(
        `時間割結果取得でエラーが発生しました: ${result.error || '不明なエラー'}`
      )
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
    console.error('時間割結果取得で不明なエラーが発生しました', error)
    return null
  }
}
