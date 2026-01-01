'use server'

import type {
  Course,
  Subject,
  Discipline,
  Grade,
} from '@/app/(private)/curriculum/types'
import type {
  GraphQLCourse,
  GraphQLSubject,
  GraphQLDiscipline,
  GraphQLGrade,
} from '@/app/(private)/curriculum/graphql/types'
import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLForServerAction } from '@/lib/graphql-client'
import { FETCH_COURSE_DETAILS } from '@/app/(private)/curriculum/graphql/queries'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

/**
 * GraphQL型からSubject型に変換
 *
 * @param graphqlSubject - GraphQL型の科目データ
 * @returns Subject型の科目データ
 * @throws {Error} 必須フィールドが欠損している場合
 */
function convertGraphQLSubjectToSubject(
  graphqlSubject: GraphQLSubject
): Subject {
  if (!graphqlSubject.id) {
    throw new Error('科目IDが取得できませんでした')
  }
  if (!graphqlSubject.subjectName) {
    throw new Error('科目名が取得できませんでした')
  }

  return {
    id: graphqlSubject.id,
    subjectName: graphqlSubject.subjectName,
    credits: graphqlSubject.credits || null,
    discipline: graphqlSubject.discipline
      ? (() => {
          if (!graphqlSubject.discipline!.disciplineCode) {
            throw new Error('教科コードが取得できませんでした')
          }
          if (!graphqlSubject.discipline!.disciplineName) {
            throw new Error('教科名が取得できませんでした')
          }
          return {
            disciplineCode: graphqlSubject.discipline!.disciplineCode,
            disciplineName: graphqlSubject.discipline!.disciplineName,
          } as Discipline
        })()
      : undefined,
    grade: graphqlSubject.grade
      ? (() => {
          if (!graphqlSubject.grade!.id) {
            throw new Error('学年IDが取得できませんでした')
          }
          if (!graphqlSubject.grade!.gradeName) {
            throw new Error('学年名が取得できませんでした')
          }
          return {
            id: graphqlSubject.grade!.id,
            gradeName: graphqlSubject.grade!.gradeName,
            ttid: graphqlSubject.grade!.ttid,
          } as Grade
        })()
      : null,
  }
}

/**
 * GraphQL型からCourse型に変換
 *
 * @param graphqlCourse - GraphQL型の講座データ
 * @returns Course型の講座データ
 * @throws {Error} 必須フィールドが欠損している場合
 */
function convertGraphQLCourseToCourse(graphqlCourse: GraphQLCourse): Course {
  if (!graphqlCourse.id) {
    throw new Error('講座IDが取得できませんでした')
  }
  if (!graphqlCourse.courseName) {
    throw new Error('講座名が取得できませんでした')
  }

  return {
    id: graphqlCourse.id,
    courseName: graphqlCourse.courseName,
    subject: graphqlCourse.subject
      ? convertGraphQLSubjectToSubject(graphqlCourse.subject)
      : null,
    courseDetails: (graphqlCourse.courseDetails || [])
      .filter(
        detail => detail.instructor !== null && detail.instructor !== undefined
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
          },
          room: detail.room
            ? (() => {
                if (!detail.room!.id) {
                  throw new Error('教室IDが取得できませんでした')
                }
                if (!detail.room!.roomName) {
                  throw new Error('教室名が取得できませんでした')
                }
                return {
                  id: detail.room!.id,
                  roomName: detail.room!.roomName,
                }
              })()
            : null,
        }
      }),
  }
}

/**
 * 講座の詳細情報を取得するServer Action
 *
 * @param _prevState - 前回の状態
 * @param formData - フォームデータ
 * @returns 講座詳細の取得結果
 */
export async function fetchCourseDetails(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult<Course>> {
  const courseId = formData.get('courseId') as string

  // システムエラー
  if (!courseId) {
    const appError = createAppError(
      new Error('講座IDが指定されていません'),
      ErrorCode.DATA_VALIDATION_ERROR
    )
    logger.error(appError.getMessage())
    return errorResult(appError)
  }

  // 講座の詳細情報を取得する
  try {
    const result = await executeGraphQLForServerAction<GraphQLCourse[]>(
      {
        query: FETCH_COURSE_DETAILS,
        variables: {
          input: {
            id: courseId,
          },
        },
      },
      'courses'
    )

    if (!result.success || !result.data || result.data.length === 0) {
      // 講座の詳細情報の取得に失敗した場合
      const appError = createAppError(
        new Error(result.error || UNKNOWN_ERROR_MESSAGE),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error(appError.getMessage())
      return errorResult(appError)
    }

    // ドメイン型に変換
    const course = convertGraphQLCourseToCourse(result.data[0])
    return successResult(course)
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error(appError.getMessage())
    return errorResult(appError)
  }
}
