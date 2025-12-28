'use server'

import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation } from '@/lib/graphql-client'
import { DELETE_BLOCK } from '@/app/(private)/curriculum/graphql/mutations'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

/**
 * ブロックを削除するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @param formData - フォームデータ（blockId）
 * @returns ブロック削除結果
 */
export async function deleteBlock(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const blockId = formData.get('blockId') as string

  // システムエラー
  if (!blockId?.trim()) {
    // ブロックIDが欠損している場合
    const appError = createAppError(
      new Error('ブロックIDが指定されていません'),
      ErrorCode.DATA_VALIDATION_ERROR
    )
    logger.error(appError.getMessage())
    return errorResult(appError)
  }

  // ブロックを削除
  try {
    const result = await executeGraphQLMutation<boolean>(
      {
        query: DELETE_BLOCK,
        variables: {
          id: blockId,
        },
      },
      'deleteBlock'
    )

    if (!result.success) {
      const appError = createAppError(
        new Error(result.error || UNKNOWN_ERROR_MESSAGE),
        ErrorCode.DATA_VALIDATION_ERROR
      )
      logger.error(appError.getMessage())
      return errorResult(appError)
    }

    revalidatePath('/curriculum')
    return successResult({})
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_VALIDATION_ERROR)
    logger.error(appError.getMessage())
    return errorResult(appError)
  }
}
