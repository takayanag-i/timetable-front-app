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
import type { ConstraintDefinitionMasterResponse } from '@/lib/graphql/types'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

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

    if (!result.success || !result.data) {
      const appError = createAppError(
        new Error(result.error || '不明なエラー'),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error('Failed to fetch constraint definitions', appError)
      return []
    }

    return result.data
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error('Error fetching constraint definitions', appError)
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
      const appError = createAppError(
        new Error(result.error || '不明なエラー'),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error('Failed to fetch constraint definition masters', appError)
      return []
    }

    // 必須制約を除外（mandatoryFlagがtrueのものは除外）
    return result.data.filter(master => !master.mandatoryFlag)
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error('Error fetching constraint definition masters', appError)
    return []
  }
}
