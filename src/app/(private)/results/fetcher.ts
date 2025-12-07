import 'server-only'

import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { GET_TIMETABLE_RESULTS } from '@/lib/graphql/queries'
import type { TimetableResultType } from '@/lib/graphql/types'

export async function getTimetableResult(
  resultId: string
): Promise<TimetableResultType | null> {
  try {
    const result = await executeGraphQLForServerAction<TimetableResultType[]>(
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
