import 'server-only'

import { ConstraintDefinition, Course, SchoolDay } from '@/core/domain/entity'
import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import {
  GET_CONSTRAINT_DEFINITIONS,
  GET_CONSTRAINT_DEFINITION_MASTERS,
  FETCH_SCHOOL_DAYS,
  GET_COURSES,
} from '@/app/(private)/constraints/graphql/queries'
import type { ConstraintDefinitionMasterResponse } from '@/app/(private)/constraints/graphql/types'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

/**
 * 講座一覧を取得する（講座名解決用）
 *
 * @returns 講座一覧
 */
export async function getCourses(): Promise<Course[]> {
  try {
    const ttid = getDefaultTtid()

    const result = await executeGraphQLForServerAction<Course[]>(
      {
        query: GET_COURSES,
        variables: {
          input: {
            ttid,
          },
        },
      },
      'courses'
    )

    if (!result.success || !result.data) {
      const appError = createAppError(
        new Error(result.error || '不明なエラー'),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error('Failed to fetch courses', appError)
      return []
    }

    return result.data
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error('Error fetching courses', appError)
    return []
  }
}

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

/**
 * 1日あたりの最大時限数を取得
 * schoolDaysから利用可能な曜日の最大時限数（午前+午後）を算出
 */
export async function getMaxPeriodsPerDay(): Promise<number> {
  try {
    const ttid = getDefaultTtid()

    const result = await executeGraphQLForServerAction<SchoolDay[]>(
      {
        query: FETCH_SCHOOL_DAYS,
        variables: {
          input: {
            ttid,
          },
        },
      },
      'schoolDays'
    )

    if (!result.success || !result.data || result.data.length === 0) {
      // デフォルト値（午前4 + 午後3 = 7時限）
      return 7
    }

    // 利用可能な曜日の最大時限数を算出
    const maxPeriods = Math.max(
      ...result.data
        .filter(day => day.isAvailable)
        .map(day => day.amPeriods + day.pmPeriods)
    )

    return maxPeriods > 0 ? maxPeriods : 7
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error('Error fetching max periods per day', appError)
    return 7
  }
}
