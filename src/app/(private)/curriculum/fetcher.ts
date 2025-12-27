import 'server-only' // client componentでimportするとエラーにする

import type { Grade, Homeroom } from '@/app/(private)/curriculum/types'
import type { GraphQLHomeroomType } from '@/app/(private)/curriculum/graphql/types'
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
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

// 学級・学年一覧の複合レスポンス型（GraphQL型）
interface HomeroomsAndGradesResponse {
  homerooms: GraphQLHomeroomType[]
  grades: Grade[]
}

/**
 * GraphQL型からHomeroom型に変換
 */
function convertGraphQLHomeroomToHomeroom(
  graphqlHomeroom: GraphQLHomeroomType
): Homeroom {
  return {
    id: graphqlHomeroom.id,
    homeroomName: graphqlHomeroom.homeroomName,
    grade: graphqlHomeroom.grade
      ? {
          id: graphqlHomeroom.grade.id,
          gradeName: graphqlHomeroom.grade.gradeName,
        }
      : null,
    homeroomDays: graphqlHomeroom.homeroomDays.map(day => ({
      id: day.id,
      dayOfWeek: day.dayOfWeek,
      periods: day.periods,
    })),
    blocks: graphqlHomeroom.blocks.map(block => ({
      id: block.id,
      blockName: block.blockName,
      lanes: block.lanes.map(lane => ({
        id: lane.id,
        courses: lane.courses.map(course => ({
          id: course.id,
          courseName: course.courseName,
          subject: course.subject
            ? {
                id: course.subject.id,
                subjectName: course.subject.subjectName || '',
                credits: course.subject.credits || null,
              }
            : null,
          courseDetails: course.courseDetails
            .filter(
              detail =>
                detail.instructor !== null && detail.instructor !== undefined
            )
            .map(detail => ({
              id: detail.id,
              instructor: {
                id: detail.instructor!.id,
                instructorName: detail.instructor!.instructorName,
                disciplineCode: '', // GraphQLレスポンスに含まれていないため空文字列
              },
              room: detail.room
                ? {
                    id: detail.room.id,
                    roomName: detail.room.roomName,
                  }
                : null,
            })),
        })),
      })),
    })),
  }
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
        new Error(result.error || UNKNOWN_ERROR_MESSAGE),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error(appError.getMessage())
      return { homerooms: [], grades: [] }
    }

    // GraphQL型からHomeroom型に変換
    const homerooms = (result.data.homerooms || []).map(
      convertGraphQLHomeroomToHomeroom
    )

    return {
      homerooms,
      grades: result.data.grades || [],
    }
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error(appError.getMessage())
    return { homerooms: [], grades: [] }
  }
}

export async function getHomerooms(): Promise<Homeroom[]> {
  try {
    const ttid = getDefaultTtid()

    // GraphQLから取得
    const result = await executeGraphQLForServerAction<GraphQLHomeroomType[]>(
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
        new Error(result.error || UNKNOWN_ERROR_MESSAGE),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error(appError.getMessage())
      return []
    }

    // GraphQL型からHomeroom型に変換
    return result.data.map(convertGraphQLHomeroomToHomeroom)
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error(appError.getMessage())
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
        new Error(result.error || UNKNOWN_ERROR_MESSAGE),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error(appError.getMessage())
      return []
    }

    return result.data
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error(appError.getMessage())
    return []
  }
}
