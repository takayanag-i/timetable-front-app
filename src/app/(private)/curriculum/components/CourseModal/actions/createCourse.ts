'use server'

import { revalidatePath } from 'next/cache'
import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import {
  executeGraphQLForServerAction,
  executeGraphQLMutation,
} from '@/lib/graphql-client'
import { FETCH_LANES } from '@/app/(private)/curriculum/graphql/queries'
import {
  UPSERT_COURSES,
  UPSERT_LANES,
} from '@/app/(private)/curriculum/graphql/mutations'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode } from '@/lib/errors'

/**
 * 講座を作成してレーンに追加するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @param formData - フォームデータ（subjectId, courseName, instructorIds, selectedCourseId, laneId）
 * @returns 講座作成結果
 */
export async function createCourse(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
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
  const selectedCourseIdRaw = formData.get('selectedCourseId')
  const laneId = formData.get('laneId') as string
  const selectedCourseId =
    typeof selectedCourseIdRaw === 'string' ? selectedCourseIdRaw.trim() : ''

  if (!laneId) {
    return errorResult('レーンが選択されていません')
  }

  const addCourseToLane = async (courseId: string, message: string) => {
    const lanesResult = await executeGraphQLForServerAction<
      Array<{ id: string; courses: Array<{ id: string }> }>
    >(
      {
        query: FETCH_LANES,
        variables: {
          input: {
            id: laneId,
          },
        },
      },
      'lanes'
    )

    if (
      !lanesResult.success ||
      !lanesResult.data ||
      lanesResult.data.length === 0
    ) {
      const appError = createAppError(
        new Error(lanesResult.error || '不明なエラー'),
        ErrorCode.DATA_NOT_FOUND
      )
      logger.error('Failed to fetch lane information', appError)
      return errorResult(
        `レーン情報の取得に失敗しました: ${appError.getMessage()}`
      )
    }

    const existingCourseIds = lanesResult.data[0].courses.map(
      course => course.id
    )

    if (existingCourseIds.includes(courseId)) {
      return errorResult('選択した講座は既にこのレーンに存在します')
    }

    const updatedLanesResult = await executeGraphQLMutation<
      Array<{ id: string }>
    >(
      {
        query: UPSERT_LANES,
        variables: {
          input: {
            lanes: [
              {
                id: laneId,
                courseIds: [...existingCourseIds, courseId],
              },
            ],
            by: 'system',
          },
        },
      },
      'upsertLanes'
    )

    if (!updatedLanesResult.success || !updatedLanesResult.data) {
      const appError = createAppError(
        new Error(updatedLanesResult.error || '不明なエラー'),
        ErrorCode.DATA_VALIDATION_ERROR
      )
      logger.error('Failed to update lane', appError)
      return errorResult(`レーンの更新に失敗しました: ${appError.getMessage()}`)
    }

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult({ message })
  }

  if (selectedCourseId) {
    return addCourseToLane(selectedCourseId, '既存の講座をレーンに追加しました')
  }

  if (!subjectId || !courseName || instructorIds.length === 0) {
    return errorResult('すべての項目を入力してください')
  }

  try {
    // 1. 講座を作成（GraphQLから直接）
    const coursesResult = await executeGraphQLMutation<
      Array<{ id: string; courseName: string }>
    >(
      {
        query: UPSERT_COURSES,
        variables: {
          input: {
            courses: [
              {
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

    if (
      !coursesResult.success ||
      !coursesResult.data ||
      coursesResult.data.length === 0
    ) {
      const appError = createAppError(
        new Error(coursesResult.error || '不明なエラー'),
        ErrorCode.DATA_VALIDATION_ERROR
      )
      logger.error('Failed to create course', appError)
      return errorResult(`講座の作成に失敗しました: ${appError.getMessage()}`)
    }

    const newCourseId = coursesResult.data[0].id

    // 2. レーンを更新（新講座を追加）
    return addCourseToLane(newCourseId, '講座を作成しレーンに追加しました')
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_VALIDATION_ERROR)
    logger.error('Error creating course and adding to lane', appError)
    return errorResult(appError)
  }
}
