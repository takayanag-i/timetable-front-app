'use server'

import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import {
  executeGraphQLForServerAction,
  executeGraphQLMutation,
} from '@/lib/graphql-client'
import { FETCH_LANES } from '@/app/(private)/curriculum/graphql/queries'
import { UPSERT_LANES } from '@/app/(private)/curriculum/graphql/mutations'
import type { GraphQLLane } from '@/app/(private)/curriculum/graphql/types'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

/**
 * レーンから講座を削除するServer Action
 *
 * @param _prevState - 前回の状態
 * @param formData - フォームデータ
 * @returns 講座削除結果
 */
export async function removeCourseFromLane(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const laneId = formData.get('laneId') as string
  const courseId = formData.get('courseId') as string

  // システムエラー
  if (!laneId || !courseId) {
    const appError = createAppError(
      new Error('レーンIDと講座IDが必要です'),
      ErrorCode.DATA_VALIDATION_ERROR
    )
    logger.error(appError.getMessage())
    return errorResult(appError)
  }

  try {
    // レーンを取得
    const lanesResult = await executeGraphQLForServerAction<GraphQLLane[]>(
      {
        query: FETCH_LANES,
        variables: {
          input: {
            id: laneId,
          },
        },
      },
      'lanes'
    )

    if (
      !lanesResult.success ||
      !lanesResult.data ||
      lanesResult.data.length === 0
    ) {
      // レーンの取得に失敗した場合
      const appError = createAppError(
        new Error(lanesResult.error || UNKNOWN_ERROR_MESSAGE),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error(appError.getMessage())
      return errorResult(appError)
    }

    const lane = lanesResult.data[0]
    if (!lane.courses) {
      // 講座情報が取得できなかった場合
      const appError = createAppError(
        new Error('講座情報が取得できませんでした'),
        ErrorCode.DATA_VALIDATION_ERROR
      )
      logger.error(appError.getMessage())
      return errorResult(appError)
    }

    const existingCourseIds = lane.courses.map(course => {
      if (!course.id) {
        throw new Error('講座IDが取得できませんでした')
      }
      return course.id
    })

    // 指定された講座を除外する
    const updatedCourseIds = existingCourseIds.filter(id => id !== courseId)

    // レーンを更新する
    const updatedLanesResult = await executeGraphQLMutation<GraphQLLane[]>(
      {
        query: UPSERT_LANES,
        variables: {
          input: {
            lanes: [
              {
                id: laneId,
                courseIds: updatedCourseIds,
              },
            ],
            by: 'system',
          },
        },
      },
      'upsertLanes'
    )

    if (!updatedLanesResult.success || !updatedLanesResult.data) {
      // レーンの更新に失敗した場合
      const appError = createAppError(
        new Error(updatedLanesResult.error || UNKNOWN_ERROR_MESSAGE),
        ErrorCode.DATA_VALIDATION_ERROR
      )
      logger.error(appError.getMessage())
      return errorResult(appError)
    }

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult({})
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_VALIDATION_ERROR)
    logger.error(appError.getMessage())
    return errorResult(appError)
  }
}
