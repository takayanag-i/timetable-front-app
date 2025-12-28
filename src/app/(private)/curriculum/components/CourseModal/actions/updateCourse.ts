'use server'

import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation } from '@/lib/graphql-client'
import { UPSERT_COURSES } from '@/app/(private)/curriculum/graphql/mutations'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

/**
 * 講座を更新するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @param formData - フォームデータ（courseId, subjectId, courseName, instructorIds）
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
        .map(value => (typeof value === 'string' ? value.trim() : ''))
        .filter((value): value is string => value.length > 0)
    )
  )

  if (!courseId || !subjectId || !courseName || instructorIds.length === 0) {
    return errorResult('すべての項目を入力してください')
  }

  try {
    // 講座を更新（既存のIDを使用）
    const result = await executeGraphQLMutation<
      Array<{ id: string; courseName: string }>
    >(
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
      const appError = createAppError(
        new Error(result.error || '不明なエラー'),
        ErrorCode.DATA_VALIDATION_ERROR
      )
      logger.error('Failed to update course', appError)
      return errorResult(`講座の更新に失敗しました: ${appError.getMessage()}`)
    }

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult({ message: '講座を更新しました' })
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_VALIDATION_ERROR)
    logger.error('Error updating course', appError)
    return errorResult(appError)
  }
}
