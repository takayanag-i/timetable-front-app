'use server'

import { ActionResult } from '@/types/server-action-types'
import type { SchoolDay } from '@/app/(private)/curriculum/types'
import { errorResult, successResult } from '@/lib/action-helpers'
import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { FETCH_SCHOOL_DAYS } from '@/app/(private)/curriculum/graphql/queries'
import type { GraphQLSchoolDay } from '@/app/(private)/curriculum/graphql/types'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

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

    const result = await executeGraphQLForServerAction<GraphQLSchoolDay[]>(
      {
        query: FETCH_SCHOOL_DAYS,
        variables: {
          input: {
            ttid,
          },
        },
      },
      'schoolDays'
    )

    if (!result.success || !result.data) {
      const appError = createAppError(
        new Error(result.error || UNKNOWN_ERROR_MESSAGE),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error(appError.getMessage())
      return errorResult(appError)
    }

    // GraphQL型からSchoolDay型に変換
    const schoolDays: SchoolDay[] = result.data.map(graphqlSchoolDay => {
      if (!graphqlSchoolDay.id) {
        throw new Error('学校曜日IDが取得できませんでした')
      }
      if (!graphqlSchoolDay.dayOfWeek) {
        throw new Error('曜日が取得できませんでした')
      }
      if (graphqlSchoolDay.isAvailable === undefined) {
        throw new Error('利用可能フラグが取得できませんでした')
      }

      return {
        id: graphqlSchoolDay.id,
        dayOfWeek: graphqlSchoolDay.dayOfWeek,
        amPeriods: graphqlSchoolDay.amPeriods ?? 0,
        pmPeriods: graphqlSchoolDay.pmPeriods ?? 0,
        isAvailable: graphqlSchoolDay.isAvailable,
      }
    })

    return successResult(schoolDays)
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error(appError.getMessage())
    return errorResult(appError)
  }
}
