'use server'

import type { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLForServerAction } from '@/lib/graphql-client'
import { FETCH_HOMEROOM } from '@/app/(private)/curriculum/graphql/queries'
import type { HomeroomForEdit } from '@/app/(private)/curriculum/types'
import type { GraphQLHomeroom } from '@/app/(private)/curriculum/graphql/types'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

/**
 * 学級を取得するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @param formData - フォームデータ（homeroomId）
 * @returns 学級の取得結果（blocksを含まない）
 */
export async function fetchHomeroom(
  _prevState: ActionResult<HomeroomForEdit> | null,
  formData: FormData
): Promise<ActionResult<HomeroomForEdit>> {
  const id = formData.get('homeroomId') as string

  if (!id) {
    return errorResult('学級IDが指定されていません')
  }

  try {
    // 学級IDで学級を取得（編集モーダル用の最小限のデータのみ）
    const result = await executeGraphQLForServerAction<GraphQLHomeroom[]>(
      {
        query: FETCH_HOMEROOM,
        variables: {
          input: {
            id,
          },
        },
      },
      'homerooms'
    )

    if (!result.success || !result.data || result.data.length === 0) {
      const appError = createAppError(
        new Error(result.error || UNKNOWN_ERROR_MESSAGE),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error(appError.getMessage())
      return errorResult(appError)
    }

    // GraphQL型からHomeroomForEdit型に変換
    const graphqlHomeroom = result.data[0]

    if (!graphqlHomeroom.id) {
      throw new Error('学級IDが取得できませんでした')
    }
    if (!graphqlHomeroom.homeroomName) {
      throw new Error('学級名が取得できませんでした')
    }

    const homeroom: HomeroomForEdit = {
      id: graphqlHomeroom.id,
      homeroomName: graphqlHomeroom.homeroomName,
      grade: graphqlHomeroom.grade
        ? (() => {
            if (!graphqlHomeroom.grade.id) {
              throw new Error('学年IDが取得できませんでした')
            }
            if (!graphqlHomeroom.grade.gradeName) {
              throw new Error('学年名が取得できませんでした')
            }
            return {
              id: graphqlHomeroom.grade.id,
              gradeName: graphqlHomeroom.grade.gradeName,
            }
          })()
        : null,
      homeroomDays: (graphqlHomeroom.homeroomDays || []).map(day => {
        if (!day.id) {
          throw new Error('学級曜日IDが取得できませんでした')
        }
        if (!day.dayOfWeek) {
          throw new Error('曜日が取得できませんでした')
        }
        if (day.periods === undefined || day.periods === null) {
          throw new Error('時限数が取得できませんでした')
        }
        return {
          id: day.id,
          dayOfWeek: day.dayOfWeek,
          periods: day.periods,
        }
      }),
    }

    return successResult(homeroom)
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error(appError.getMessage())

    return errorResult(appError)
  }
}
