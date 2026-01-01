import 'server-only' // client componentでimportするとエラーにする

import type { Grade, Homeroom } from '@/app/(private)/curriculum/types'
import type {
  GraphQLHomeroom,
  GraphQLGrade,
  HomeroomsAndGradesResponse,
} from '@/app/(private)/curriculum/graphql/types'
import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { FETCH_HOMEROOMS_AND_GRADES } from '@/app/(private)/curriculum/graphql/queries'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

/**
 * GraphQL型からGrade型に変換
 *
 * @param graphqlGrade - GraphQL型の学年データ
 * @returns Grade型の学年データ
 * @throws {Error} 必須フィールドが欠損している場合
 */
function convertGraphQLGradeToGrade(graphqlGrade: GraphQLGrade): Grade {
  if (!graphqlGrade.id) {
    throw new Error('学年IDが取得できませんでした')
  }
  if (!graphqlGrade.gradeName) {
    throw new Error('学年名が取得できませんでした')
  }

  return {
    id: graphqlGrade.id,
    gradeName: graphqlGrade.gradeName,
    ttid: graphqlGrade.ttid,
  }
}

/**
 * GraphQL型からHomeroom型に変換
 *
 * @param graphqlHomeroom - GraphQL型の学級データ
 * @returns Homeroom型の学級データ
 * @throws {Error} 必須フィールドが欠損している場合
 */
function convertGraphQLHomeroomToHomeroom(
  graphqlHomeroom: GraphQLHomeroom
): Homeroom {
  if (!graphqlHomeroom.id) {
    throw new Error('学級IDが取得できませんでした')
  }
  if (!graphqlHomeroom.homeroomName) {
    throw new Error('学級名が取得できませんでした')
  }

  return {
    id: graphqlHomeroom.id,
    homeroomName: graphqlHomeroom.homeroomName,
    grade: graphqlHomeroom.grade
      ? (() => {
          if (!graphqlHomeroom.grade.id) {
            throw new Error('学年IDが取得できませんでした')
          }
          if (!graphqlHomeroom.grade.gradeName) {
            throw new Error('学年名が取得できませんでした')
          }
          return {
            id: graphqlHomeroom.grade.id,
            gradeName: graphqlHomeroom.grade.gradeName,
          }
        })()
      : null,
    homeroomDays: (graphqlHomeroom.homeroomDays || []).map(day => {
      if (!day.id) {
        throw new Error('学級曜日IDが取得できませんでした')
      }
      if (!day.dayOfWeek) {
        throw new Error('曜日が取得できませんでした')
      }
      if (day.periods === undefined || day.periods === null) {
        throw new Error('時限数が取得できませんでした')
      }
      return {
        id: day.id,
        dayOfWeek: day.dayOfWeek,
        periods: day.periods,
      }
    }),
    blocks: (graphqlHomeroom.blocks || []).map(block => {
      if (!block.id) {
        throw new Error('ブロックIDが取得できませんでした')
      }
      if (!block.blockName) {
        throw new Error('ブロック名が取得できませんでした')
      }
      return {
        id: block.id,
        blockName: block.blockName,
        lanes: (block.lanes || []).map(lane => {
          if (!lane.id) {
            throw new Error('レーンIDが取得できませんでした')
          }
          return {
            id: lane.id,
            courses: (lane.courses || []).map(course => {
              if (!course.id) {
                throw new Error('講座IDが取得できませんでした')
              }
              if (!course.courseName) {
                throw new Error('講座名が取得できませんでした')
              }
              return {
                id: course.id,
                courseName: course.courseName,
                subject: course.subject
                  ? (() => {
                      if (!course.subject.id) {
                        throw new Error('科目IDが取得できませんでした')
                      }
                      if (!course.subject.subjectName) {
                        throw new Error('科目名が取得できませんでした')
                      }
                      return {
                        id: course.subject.id,
                        subjectName: course.subject.subjectName,
                        credits: course.subject.credits || null,
                      }
                    })()
                  : null,
                courseDetails: (course.courseDetails || [])
                  .filter(
                    detail =>
                      detail.instructor !== null &&
                      detail.instructor !== undefined
                  )
                  .map(detail => {
                    if (!detail.id) {
                      throw new Error('講座詳細IDが取得できませんでした')
                    }
                    if (!detail.instructor) {
                      throw new Error('教員情報が取得できませんでした')
                    }
                    if (!detail.instructor.id) {
                      throw new Error('教員IDが取得できませんでした')
                    }
                    if (!detail.instructor.instructorName) {
                      throw new Error('教員名が取得できませんでした')
                    }
                    return {
                      id: detail.id,
                      instructor: {
                        id: detail.instructor.id,
                        instructorName: detail.instructor.instructorName,
                        disciplineCode: detail.instructor.disciplineCode,
                      },
                      room: detail.room
                        ? (() => {
                            if (!detail.room.id) {
                              throw new Error('教室IDが取得できませんでした')
                            }
                            if (!detail.room.roomName) {
                              throw new Error('教室名が取得できませんでした')
                            }
                            return {
                              id: detail.room.id,
                              roomName: detail.room.roomName,
                            }
                          })()
                        : null,
                    }
                  }),
              }
            }),
          }
        }),
      }
    }),
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
          query: FETCH_HOMEROOMS_AND_GRADES,
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

    // GraphQL型からGrade型に変換
    const grades = (result.data.grades || []).map(convertGraphQLGradeToGrade)

    return {
      homerooms,
      grades,
    }
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error(appError.getMessage())
    return { homerooms: [], grades: [] }
  }
}
