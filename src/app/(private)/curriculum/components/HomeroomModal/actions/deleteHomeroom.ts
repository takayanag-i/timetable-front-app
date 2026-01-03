'use server'

import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation } from '@/lib/graphql-client'
import { DELETE_HOMEROOM } from '@/app/(private)/curriculum/graphql/mutations'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

/**
 * 学級を削除するServer Action
 *
 * @param _prevState - 前回の状態
 * @param formData - フォームデータ
 * @returns 学級削除結果
 */
export async function deleteHomeroom(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const homeroomId = formData.get('homeroomId') as string

    // システムエラー
    if (!homeroomId) {
      const appError = createAppError(
        new Error('学級IDが指定されていません'),
        ErrorCode.DATA_VALIDATION_ERROR
      )
      logger.error(appError.getMessage())
      return errorResult(appError)
    }

    const result = await executeGraphQLMutation<boolean>(
      {
        query: DELETE_HOMEROOM,
        variables: {
          id: homeroomId,
        },
      },
      'deleteHomeroom'
    )

    if (!result.success || !result.data) {
      const appError = createAppError(
        new Error(result.error || UNKNOWN_ERROR_MESSAGE),
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
