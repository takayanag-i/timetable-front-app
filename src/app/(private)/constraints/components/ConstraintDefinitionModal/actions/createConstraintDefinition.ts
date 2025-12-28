'use server'

import { revalidatePath } from 'next/cache'
import { ConstraintDefinition } from '@/core/domain/entity'
import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation, getDefaultTtid } from '@/lib/graphql-client'
import { UPSERT_CONSTRAINT_DEFINITIONS } from '@/app/(private)/constraints/graphql/mutations'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

/**
 * 制約定義を作成するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @param formData - フォームデータ（constraintDefinitionCode, softFlag, penaltyWeight, parameters）
 * @returns 制約定義作成結果
 */
export async function createConstraintDefinition(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const constraintDefinitionCode = formData.get(
    'constraintDefinitionCode'
  ) as string
  const softFlag = formData.get('softFlag') === 'true'
  const penaltyWeightStr = formData.get('penaltyWeight') as string | null
  const parametersStr = formData.get('parameters') as string | null

  if (!constraintDefinitionCode) {
    return errorResult('制約定義コードが指定されていません')
  }

  try {
    const ttid = getDefaultTtid()

    // ペナルティ重みの変換
    let penaltyWeight: number | null = null
    if (penaltyWeightStr && penaltyWeightStr.trim() !== '') {
      const parsed = parseFloat(penaltyWeightStr)
      if (!isNaN(parsed)) {
        penaltyWeight = parsed
      }
    }

    // パラメータの変換
    let parameters: unknown = null
    if (parametersStr && parametersStr.trim() !== '') {
      try {
        parameters = JSON.parse(parametersStr)
      } catch {
        const appError = createAppError(
          new Error('Invalid parameters JSON'),
          ErrorCode.DATA_PARSING_ERROR
        )
        logger.error('Invalid parameters JSON', appError)
        return errorResult('パラメータのJSON形式が正しくありません')
      }
    }

    const result = await executeGraphQLMutation<ConstraintDefinition[]>(
      {
        query: UPSERT_CONSTRAINT_DEFINITIONS,
        variables: {
          input: {
            ttid,
            constraintDefinitions: [
              {
                id: null,
                constraintDefinitionCode,
                softFlag,
                penaltyWeight,
                parameters,
              },
            ],
            by: 'system', // TODO: 実際のユーザーIDを取得
          },
        },
      },
      'upsertConstraintDefinitions'
    )

    if (!result.success || !result.data) {
      const appError = createAppError(
        new Error(result.error || '不明なエラー'),
        ErrorCode.DATA_VALIDATION_ERROR
      )
      logger.error('Failed to create constraint definition', appError)
      return errorResult(
        `制約定義の作成に失敗しました: ${appError.getMessage()}`
      )
    }

    revalidatePath('/constraints')
    return successResult({ message: '制約定義を作成しました' })
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_VALIDATION_ERROR)
    logger.error('Error creating constraint definition', appError)
    return errorResult(appError)
  }
}
