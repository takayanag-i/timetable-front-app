'use server'

import type { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLForServerAction } from '@/lib/graphql-client'
import { GET_HOMEROOM_FOR_EDIT } from '@/app/(private)/curriculum/graphql/queries'
import type { HomeroomForEdit } from '@/app/(private)/curriculum/types'
import type { GraphQLHomeroomForEditType } from '@/app/(private)/curriculum/graphql/types'
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
    const result = await executeGraphQLForServerAction<
      GraphQLHomeroomForEditType[]
    >(
      {
        query: GET_HOMEROOM_FOR_EDIT,
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
    const homeroom: HomeroomForEdit = {
      id: graphqlHomeroom.id,
      homeroomName: graphqlHomeroom.homeroomName,
      grade: graphqlHomeroom.grade
        ? {
            id: graphqlHomeroom.grade.id,
            gradeName: graphqlHomeroom.grade.gradeName,
          }
        : null,
      homeroomDays: graphqlHomeroom.homeroomDays.map(day => ({
        id: day.id,
        dayOfWeek: day.dayOfWeek,
        periods: day.periods,
      })),
    }

    return successResult(homeroom)
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error(appError.getMessage())

    return errorResult(appError)
  }
}
