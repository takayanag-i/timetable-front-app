'use server'

import { ActionResult } from '@/types/bff-types'
import { SchoolDay } from '@/core/domain/entity'
import { errorResult, successResult } from '@/lib/action-helpers'
import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { GET_SCHOOL_DAYS } from '@/lib/graphql/queries'

export async function fetchSchoolDays(
  _prevState: ActionResult<SchoolDay[]> | null,
  _formData: FormData
): Promise<ActionResult<SchoolDay[]>> {
  console.log('DEBUG: 学校曜日取得Server Actionが実行されました')

  try {
    const ttid = getDefaultTtid()

    const result = await executeGraphQLForServerAction<SchoolDay[]>(
      {
        query: GET_SCHOOL_DAYS,
        variables: { ttid },
      },
      'schoolDays'
    )

    if (!result.success || !result.data) {
      return errorResult(
        `学校曜日データの取得に失敗しました: ${result.error || '不明なエラー'}`
      )
    }

    return successResult(result.data)
  } catch (error) {
    console.error('Error fetching school days:', error)
    return errorResult(
      error instanceof Error
        ? error.message
        : '学校曜日データの取得に失敗しました'
    )
  }
}
