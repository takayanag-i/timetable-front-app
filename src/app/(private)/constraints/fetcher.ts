import 'server-only'

import { ConstraintDefinition } from '@/core/domain/entity'
import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import {
  GET_CONSTRAINT_DEFINITIONS,
  GET_CONSTRAINT_DEFINITION_MASTERS,
} from '@/lib/graphql/queries'
import type {
  ConstraintDefinitionMasterResponse,
} from '@/types/graphql-types'

export async function getConstraintDefinitions(): Promise<
  ConstraintDefinition[]
> {
  try {
    const ttid = getDefaultTtid()

    const result = await executeGraphQLForServerAction<ConstraintDefinition[]>(
      {
        query: GET_CONSTRAINT_DEFINITIONS,
        variables: {
          input: {
            ttid,
          },
        },
      },
      'constraintDefinitions'
    )

    console.log('DEBUG: 制約定義一覧取得Server Componentが実行されました')

    if (!result.success || !result.data) {
      console.error(
        `制約定義一覧取得でエラーが発生しました: ${result.error || '不明なエラー'}`
      )
      return []
    }

    return result.data
  } catch (error) {
    console.error('制約定義一覧取得で不明なエラーが発生しました', error)
    return []
  }
}

export async function getConstraintDefinitionMasters(): Promise<
  ConstraintDefinitionMasterResponse[]
> {
  try {
    const result = await executeGraphQLForServerAction<
      ConstraintDefinitionMasterResponse[]
    >(
      {
        query: GET_CONSTRAINT_DEFINITION_MASTERS,
        variables: {},
      },
      'constraintDefinitionMasters'
    )

    if (!result.success || !result.data) {
      console.error(
        `制約定義マスタ取得でエラーが発生しました: ${result.error || '不明なエラー'}`
      )
      return []
    }

    // 必須制約を除外（mandatoryFlagがtrueのものは除外）
    return result.data.filter(master => !master.mandatoryFlag)
  } catch (error) {
    console.error('制約定義マスタ取得で不明なエラーが発生しました', error)
    return []
  }
}

