'use server'

import { ActionResult } from '@/types/bff-types'
import { SchoolDay } from '@/core/domain/entity'
import { errorResult, successResult } from '@/lib/action-helpers'
import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { GET_SCHOOL_DAYS } from '@/lib/graphql/queries'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

/**
 * 学校曜日を取得するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @param _formData - フォームデータ（未使用）
 * @returns 学校曜日の取得結果
 */
export async function fetchSchoolDays(
  _prevState: ActionResult<SchoolDay[]> | null,
  _formData: FormData
): Promise<ActionResult<SchoolDay[]>> {
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
      const appError = createAppError(
        new Error(result.error || '不明なエラー'),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error('Failed to fetch school days', appError)
      return errorResult(
        `学校曜日データの取得に失敗しました: ${appError.getMessage()}`
      )
    }

    return successResult(result.data)
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error('Error fetching school days', appError)
    return errorResult(appError)
  }
}
