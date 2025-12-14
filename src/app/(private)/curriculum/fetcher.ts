import 'server-only' // client componentでimportするとエラーにする

import { Grade, Homeroom } from '@/core/domain/entity'
import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import {
  GET_GRADES,
  GET_HOMEROOMS,
  GET_HOMEROOMS_AND_GRADES,
} from '@/app/(private)/curriculum/graphql/queries'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

// 学級・学年一覧の複合レスポンス型
interface HomeroomsAndGradesResponse {
  homerooms: Homeroom[]
  grades: Grade[]
}

/**
 * 学級一覧と学年一覧を同時に取得（リクエスト数削減）
 * 1回のGraphQLリクエストで両方のデータを取得することで、パフォーマンスを向上
 */
export async function getHomeroomsAndGrades(): Promise<{
  homerooms: Homeroom[]
  grades: Grade[]
}> {
  try {
    const ttid = getDefaultTtid()

    // GraphQLから学級と学年を同時に取得（1リクエスト）
    const result =
      await executeGraphQLForServerAction<HomeroomsAndGradesResponse>(
        {
          query: GET_HOMEROOMS_AND_GRADES,
          variables: {
            homeroomsInput: { ttid },
            gradesInput: { ttid },
          },
        },
        undefined // 複数フィールドを取得するため、dataFieldNameは指定しない
      )

    if (!result.success || !result.data) {
      const appError = createAppError(
        new Error(result.error || '不明なエラー'),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error('Failed to fetch homerooms and grades', appError)
      return { homerooms: [], grades: [] }
    }

    return {
      homerooms: result.data.homerooms || [],
      grades: result.data.grades || [],
    }
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error('Error fetching homerooms and grades', appError)
    return { homerooms: [], grades: [] }
  }
}

export async function getHomerooms(): Promise<Homeroom[]> {
  try {
    const ttid = getDefaultTtid()

    // GraphQLから直接取得
    const result = await executeGraphQLForServerAction<Homeroom[]>(
      {
        query: GET_HOMEROOMS,
        variables: {
          input: {
            ttid,
          },
        },
      },
      'homerooms'
    )

    if (!result.success || !result.data) {
      const appError = createAppError(
        new Error(result.error || '不明なエラー'),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error('Failed to fetch homerooms', appError)
      return []
    }

    return result.data
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error('Error fetching homerooms', appError)
    return []
  }
}

export async function getGrades(): Promise<Grade[]> {
  try {
    const ttid = getDefaultTtid()

    const result = await executeGraphQLForServerAction<Grade[]>(
      {
        query: GET_GRADES,
        variables: {
          input: {
            ttid,
          },
        },
      },
      'grades'
    )

    if (!result.success || !result.data) {
      const appError = createAppError(
        new Error(result.error || '不明なエラー'),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error('Failed to fetch grades', appError)
      return []
    }

    return result.data
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error('Error fetching grades', appError)
    return []
  }
}
