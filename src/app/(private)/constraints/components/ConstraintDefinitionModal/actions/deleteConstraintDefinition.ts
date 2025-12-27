'use server'

import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation } from '@/lib/graphql-client'
import { DELETE_CONSTRAINT_DEFINITION } from '@/app/(private)/constraints/graphql/mutations'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

/**
 * 制約定義を削除するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @param formData - フォームデータ（id）
 * @returns 制約定義削除結果
 */
export async function deleteConstraintDefinition(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const id = formData.get('id') as string

    if (!id) {
      return errorResult('制約定義IDが指定されていません')
    }

    const result = await executeGraphQLMutation<boolean>(
      {
        query: DELETE_CONSTRAINT_DEFINITION,
        variables: {
          id,
        },
      },
      'deleteConstraintDefinition'
    )

    if (!result.success) {
      const appError = createAppError(
        new Error(result.error || '不明なエラー'),
        ErrorCode.DATA_VALIDATION_ERROR
      )
      logger.error('Failed to delete constraint definition', appError)
      return errorResult(
        `制約定義の削除に失敗しました: ${appError.getMessage()}`
      )
    }

    revalidatePath('/constraints')
    return successResult({ message: '制約定義を削除しました' })
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_VALIDATION_ERROR)
    logger.error('Error deleting constraint definition', appError)
    return errorResult(appError)
  }
}
