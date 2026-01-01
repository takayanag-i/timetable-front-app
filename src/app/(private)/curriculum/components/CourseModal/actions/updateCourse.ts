'use server'

import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation } from '@/lib/graphql-client'
import { UPSERT_COURSES } from '@/app/(private)/curriculum/graphql/mutations'
import type { GraphQLCourse } from '@/app/(private)/curriculum/graphql/types'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

/**
 * 講座を更新するServer Action
 *
 * @param _prevState - 前回の状態
 * @param formData - フォームデータ
 * @returns 講座更新結果
 */
export async function updateCourse(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const courseId = formData.get('courseId') as string
  const subjectId = formData.get('subjectId') as string
  const courseName = formData.get('courseName') as string
  const instructorIds = Array.from(
    new Set(
      formData
        .getAll('instructorIds')
        .filter((value): value is string => typeof value === 'string')
        .map(value => value.trim())
        .filter(value => value.length > 0)
    )
  )

  // システムエラー
  if (!courseId) {
    const appError = createAppError(
      new Error('講座IDが指定されていません'),
      ErrorCode.DATA_VALIDATION_ERROR
    )
    logger.error(appError.getMessage())
    return errorResult(appError)
  }

  // 入力チェックエラー
  if (!subjectId?.trim()) {
    return errorResult('教科を選択してください')
  }
  if (!courseName?.trim()) {
    return errorResult('講座名を入力してください')
  }
  if (instructorIds.length === 0) {
    return errorResult('講師を選択してください')
  }

  try {
    // 講座を更新する
    const result = await executeGraphQLMutation<GraphQLCourse[]>(
      {
        query: UPSERT_COURSES,
        variables: {
          input: {
            courses: [
              {
                id: courseId,
                subjectId,
                courseName,
                courseDetails: instructorIds.map(id => ({ instructorId: id })),
              },
            ],
            by: 'system',
          },
        },
      },
      'upsertCourses'
    )

    if (!result.success || !result.data || result.data.length === 0) {
      // 講座の更新に失敗した場合
      const appError = createAppError(
        new Error(result.error || UNKNOWN_ERROR_MESSAGE),
        ErrorCode.DATA_VALIDATION_ERROR
      )
      logger.error(appError.getMessage())
      return errorResult(appError)
    }

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult({})
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_VALIDATION_ERROR)
    logger.error(appError.getMessage())
    return errorResult(appError)
  }
}
