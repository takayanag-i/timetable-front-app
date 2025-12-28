import 'server-only'

import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { GET_TIMETABLE_RESULTS_LIST } from '@/app/(private)/results/graphql/queries'
import type { TimetableResultListUiQueryResponse } from '@/app/(private)/results/graphql/types'
import { logger } from '@/lib/logger'

/**
 * 時間割結果一覧を取得する
 *
 * @returns 時間割結果一覧
 */
export async function getTimetableResultsList(): Promise<
  TimetableResultListUiQueryResponse[]
> {
  try {
    const ttid = getDefaultTtid()
    const result = await executeGraphQLForServerAction<
      TimetableResultListUiQueryResponse[]
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
