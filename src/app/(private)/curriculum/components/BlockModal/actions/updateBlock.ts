'use server'

import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation } from '@/lib/graphql-client'
import { UPSERT_BLOCKS } from '@/app/(private)/curriculum/graphql/mutations'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'
import type { UpsertBlockResponse } from '../types'

/**
 * ブロックを更新するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @param formData - フォームデータ（blockId, blockName, homeroomId）
 * @returns ブロック更新結果
 */
export async function updateBlock(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const blockId = formData.get('blockId') as string
  const blockName = formData.get('blockName') as string
  const homeroomId = formData.get('homeroomId') as string

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

  if (!homeroomId?.trim()) {
    // 学級IDが欠損している場合
    const appError = createAppError(
      new Error('学級IDが指定されていません'),
      ErrorCode.DATA_VALIDATION_ERROR
    )
    logger.error(appError.getMessage())
    return errorResult(appError)
  }

  // 入力チェックエラー
  if (!blockName?.trim()) {
    return errorResult('ブロック名を入力してください')
  }

  try {
    const result = await executeGraphQLMutation<UpsertBlockResponse[]>(
      {
        query: UPSERT_BLOCKS,
        variables: {
          input: {
            blocks: [
              {
                id: blockId,
                homeroomId,
                blockName: blockName.trim(),
              },
            ],
            by: 'system',
          },
        },
      },
      'upsertBlocks'
    )

    if (!result.success || !result.data || result.data.length === 0) {
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
