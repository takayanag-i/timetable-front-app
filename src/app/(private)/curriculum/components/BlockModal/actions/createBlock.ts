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
 * ブロックを作成するServer Action
 *
 * @param _prevState - 前回の状態
 * @param formData - フォームデータ
 * @returns ブロック作成結果
 */
export async function createBlock(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const homeroomId = formData.get('homeroomId') as string
  const blockName = formData.get('blockName') as string
  const laneCountStr = formData.get('laneCount') as string
  const laneCount = parseInt(laneCountStr) || 1

  // システムエラー
  if (!homeroomId) {
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
    // ブロック名が欠損している場合
    return errorResult('ブロック名を入力してください')
  }

  if (laneCount < 1) {
    // レーン数が1未満の場合
    return errorResult('レーン数は1以上である必要があります')
  }

  // ブロックを作成
  try {
    const result = await executeGraphQLMutation<UpsertBlockResponse[]>(
      {
        query: UPSERT_BLOCKS,
        variables: {
          input: {
            blocks: [
              {
                homeroomId,
                blockName: blockName.trim(),
                laneCount,
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

    // キャッシュを再検証
    revalidatePath('/curriculum')

    return successResult({})
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_VALIDATION_ERROR)
    logger.error(appError.getMessage())

    return errorResult(appError)
  }
}
