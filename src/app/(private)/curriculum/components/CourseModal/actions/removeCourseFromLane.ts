'use server'

import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import {
  executeGraphQLForServerAction,
  executeGraphQLMutation,
} from '@/lib/graphql-client'
import { GET_LANES } from '@/app/(private)/curriculum/graphql/queries'
import { UPSERT_LANES } from '@/app/(private)/curriculum/graphql/mutations'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

/**
 * レーンから講座を削除するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @param formData - フォームデータ（laneId, courseId）
 * @returns 講座削除結果
 */
export async function removeCourseFromLane(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const laneId = formData.get('laneId') as string
  const courseId = formData.get('courseId') as string

  if (!laneId || !courseId) {
    return errorResult('レーンIDと講座IDが必要です')
  }

  try {
    // 1. 既存のレーン情報を取得
    const lanesResult = await executeGraphQLForServerAction<
      Array<{ id: string; courses: Array<{ id: string }> }>
    >(
      {
        query: GET_LANES,
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
      const appError = createAppError(
        new Error(lanesResult.error || '不明なエラー'),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error('Failed to fetch lane information', appError)
      return errorResult(
        `レーン情報の取得に失敗しました: ${appError.getMessage()}`
      )
    }

    const existingCourseIds = lanesResult.data[0].courses.map(
      course => course.id
    )

    // 2. 指定された講座を除外
    const updatedCourseIds = existingCourseIds.filter(id => id !== courseId)

    // 3. レーンを更新（講座を削除）
    const updatedLanesResult = await executeGraphQLMutation<
      Array<{ id: string }>
    >(
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
      const appError = createAppError(
        new Error(updatedLanesResult.error || '不明なエラー'),
        ErrorCode.DATA_VALIDATION_ERROR
      )
      logger.error('Failed to update lane', appError)
      return errorResult(`レーンの更新に失敗しました: ${appError.getMessage()}`)
    }

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult({ message: 'レーンから講座を削除しました' })
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_VALIDATION_ERROR)
    logger.error('Error removing course from lane', appError)
    return errorResult(appError)
  }
}
