'use server'

import { ConstraintDefinition } from '@/core/domain/entity'
import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { GET_CONSTRAINT_DEFINITIONS } from '@/app/(private)/constraints/graphql/queries'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

/**
 * 制約定義を取得するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @param formData - フォームデータ（id）
 * @returns 制約定義の取得結果
 */
export async function fetchConstraintDefinition(
  _prevState: ActionResult<ConstraintDefinition> | null,
  formData: FormData
): Promise<ActionResult<ConstraintDefinition>> {
  const id = formData.get('id') as string

  if (!id) {
    return errorResult('制約定義IDが指定されていません')
  }

  try {
    const ttid = getDefaultTtid()

    const result = await executeGraphQLForServerAction<ConstraintDefinition[]>(
      {
        query: GET_CONSTRAINT_DEFINITIONS,
        variables: {
          input: {
            ttid,
            id,
          },
        },
      },
      'constraintDefinitions'
    )

    if (!result.success || !result.data) {
      const appError = createAppError(
        new Error(result.error || '不明なエラー'),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error('Failed to fetch constraint definition', appError)
      return errorResult(
        `制約定義の取得に失敗しました: ${appError.getMessage()}`
      )
    }

    const constraintDefinition = result.data.find(cd => cd.id === id)

    if (!constraintDefinition) {
      return errorResult('制約定義が見つかりませんでした')
    }

    return successResult(constraintDefinition)
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error('Error fetching constraint definition', appError)
    return errorResult(appError)
  }
}
