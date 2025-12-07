'use server'

import {
  executeGraphQLForServerAction,
  executeGraphQLMutation,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { GET_CONSTRAINT_DEFINITIONS } from '@/lib/graphql/queries'
import {
  UPSERT_CONSTRAINT_DEFINITIONS,
  DELETE_CONSTRAINT_DEFINITION,
} from '@/lib/graphql/mutations'
import { ConstraintDefinition } from '@/core/domain/entity'
import { ActionResult } from '@/types/bff-types'
import { errorResult, successResult } from '@/lib/action-helpers'

/**
 * 制約定義を取得
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
      return errorResult(result.error || '制約定義の取得に失敗しました')
    }

    const constraintDefinition = result.data.find(cd => cd.id === id)

    if (!constraintDefinition) {
      return errorResult('制約定義が見つかりませんでした')
    }

    return successResult(constraintDefinition)
  } catch (error) {
    console.error('Error fetching constraint definition:', error)
    return errorResult(
      error instanceof Error ? error.message : '制約定義の取得に失敗しました'
    )
  }
}

/**
 * 制約定義を作成
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
      return errorResult(result.error || '制約定義の作成に失敗しました')
    }

    return successResult({ message: '制約定義を作成しました' })
  } catch (error) {
    console.error('Error creating constraint definition:', error)
    return errorResult(
      error instanceof Error ? error.message : '制約定義の作成に失敗しました'
    )
  }
}

/**
 * 制約定義を更新
 */
export async function updateConstraintDefinition(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get('id') as string
  const constraintDefinitionCode = formData.get(
    'constraintDefinitionCode'
  ) as string
  const softFlag = formData.get('softFlag') === 'true'
  const penaltyWeightStr = formData.get('penaltyWeight') as string | null
  const parametersStr = formData.get('parameters') as string | null

  if (!id || !constraintDefinitionCode) {
    return errorResult('制約定義IDとコードが指定されていません')
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
                id,
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
      return errorResult(result.error || '制約定義の更新に失敗しました')
    }

    return successResult({ message: '制約定義を更新しました' })
  } catch (error) {
    console.error('Error updating constraint definition:', error)
    return errorResult(
      error instanceof Error ? error.message : '制約定義の更新に失敗しました'
    )
  }
}

/**
 * 制約定義を削除
 */
export async function deleteConstraintDefinition(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const id = formData.get('id') as string

  if (!id) {
    return errorResult('制約定義IDが指定されていません')
  }

  try {
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
      return errorResult(result.error || '制約定義の削除に失敗しました')
    }

    return successResult({ message: '制約定義を削除しました' })
  } catch (error) {
    console.error('Error deleting constraint definition:', error)
    return errorResult(
      error instanceof Error ? error.message : '制約定義の削除に失敗しました'
    )
  }
}
