'use server'

import { Subject, Instructor, Course } from '@/core/domain/entity'
import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { FETCH_COURSE_OPTIONS } from '@/app/(private)/constraints/graphql/queries'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

/**
 * 講座選択用のデータを取得するServer Action
 *
 * @returns 科目・教員・講座の取得結果
 */
export async function fetchCourseOptions(): Promise<
  ActionResult<{
    subjects: Subject[]
    instructors: Instructor[]
    courses: Course[]
  }>
> {
  try {
    const ttid = getDefaultTtid()

    const result = await executeGraphQLForServerAction<{
      subjects: Subject[]
      instructors: Instructor[]
      courses: Course[]
    }>(
      {
        query: FETCH_COURSE_OPTIONS,
        variables: {
          subjectsInput: { ttid },
          instructorsInput: { ttid },
          coursesInput: { ttid },
        },
      },
      undefined
    )

    if (!result.success || !result.data) {
      const appError = createAppError(
        new Error(result.error || '不明なエラー'),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error('Failed to fetch course options', appError)
      return errorResult(`データの取得に失敗しました: ${appError.getMessage()}`)
    }

    return successResult({
      subjects: result.data.subjects || [],
      instructors: result.data.instructors || [],
      courses: result.data.courses || [],
    })
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error('Error fetching course options', appError)
    return errorResult(appError)
  }
}
