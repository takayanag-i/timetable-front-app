'use server'

import { Course } from '@/core/domain/entity'
import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLForServerAction } from '@/lib/graphql-client'
import { GET_COURSE_WITH_SUBJECT } from '@/app/(private)/curriculum/graphql/queries'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

/**
 * 講座の詳細情報を取得するServer Action（編集用）
 *
 * @param _prevState - 前回の状態（未使用）
 * @param formData - フォームデータ（courseId）
 * @returns 講座詳細の取得結果
 */
export async function fetchCourseDetails(
  _prevState: ActionResult<
    Course & { subject: { id: string; subjectName: string } }
  > | null,
  formData: FormData
): Promise<
  ActionResult<Course & { subject: { id: string; subjectName: string } }>
> {
  const courseId = formData.get('courseId') as string

  if (!courseId) {
    return errorResult('講座IDが指定されていません')
  }

  try {
    const result = await executeGraphQLForServerAction<
      Array<Course & { subject: { id: string; subjectName: string } }>
    >(
      {
        query: GET_COURSE_WITH_SUBJECT,
        variables: {
          input: {
            id: courseId,
          },
        },
      },
      'courses'
    )

    if (!result.success || !result.data || result.data.length === 0) {
      const appError = createAppError(
        new Error(result.error || '講座が見つかりませんでした'),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error('Failed to fetch course details', appError)
      return errorResult(
        `講座情報の取得に失敗しました: ${appError.getMessage()}`
      )
    }

    return successResult(result.data[0])
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_NOT_FOUND)
    logger.error('Error fetching course details', appError)
    return errorResult(appError)
  }
}
