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
import type {
  GraphQLLane,
  GraphQLCourse,
} from '@/app/(private)/curriculum/graphql/types'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

/**
 * 講座をレーンに追加するServer Action
 *
 * @param _prevState - 前回の状態
 * @param formData - フォームデータ
 * @returns 講座作成結果
 */
export async function createCourse(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const laneId = formData.get('laneId') as string
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
  const selectedCourseId = formData.get('selectedCourseId') as string

  // システムエラー
  if (!laneId) {
    const appError = createAppError(
      new Error('レーンIDが指定されていません'),
      ErrorCode.DATA_VALIDATION_ERROR
    )
    logger.error(appError.getMessage())
    return errorResult(appError)
  }

  // 講座をレーンに追加する
  const addCourseToLane = async (courseId: string) => {
    try {
      // レーンIDでレーンを取得する
      const lanesResult = await executeGraphQLForServerAction<GraphQLLane[]>(
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
        // レーンの取得に失敗した場合
        const appError = createAppError(
          new Error(lanesResult.error || UNKNOWN_ERROR_MESSAGE),
          ErrorCode.DATA_NOT_FOUND
        )
        logger.error(appError.getMessage())
        return errorResult(appError)
      }

      const lane = lanesResult.data[0]
      if (!lane.courses) {
        throw new Error('講座情報が取得できませんでした')
      }

      const existingCourseIds = lane.courses.map(course => {
        if (!course.id) {
          throw new Error('講座IDが取得できませんでした')
        }
        return course.id
      })

      if (existingCourseIds.includes(courseId)) {
        // 選択した講座がすでにレーンに登録されている場合
        return errorResult('選択した講座は既にこのレーンに存在します')
      }

      // レーンを更新する
      const updatedLanesResult = await executeGraphQLMutation<GraphQLLane[]>(
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
        // レーンの更新に失敗した場合
        const appError = createAppError(
          new Error(updatedLanesResult.error || UNKNOWN_ERROR_MESSAGE),
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

  // 講座を作成してレーンに追加する
  const createCourseAndAddToLane = async (
    subjectId: string,
    courseName: string,
    instructorIds: string[]
  ): Promise<ActionResult> => {
    // 入力チェック（ユーザー入力エラー）
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
      // 講座を作成する
      const coursesResult = await executeGraphQLMutation<GraphQLCourse[]>(
        {
          query: UPSERT_COURSES,
          variables: {
            input: {
              courses: [
                {
                  subjectId,
                  courseName,
                  courseDetails: instructorIds.map(id => ({
                    instructorId: id,
                  })),
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
        // 講座の作成に失敗した場合
        const appError = createAppError(
          new Error(coursesResult.error || UNKNOWN_ERROR_MESSAGE),
          ErrorCode.DATA_VALIDATION_ERROR
        )
        logger.error(appError.getMessage())
        return errorResult(appError)
      }

      const newCourse = coursesResult.data[0]
      if (!newCourse.id) {
        // 作成した講座IDが正しく取得できなかった場合
        const appError = createAppError(
          new Error('作成した講座IDが取得できませんでした'),
          ErrorCode.DATA_VALIDATION_ERROR
        )
        logger.error(appError.getMessage())
        return errorResult(appError)
      }

      // レーンを更新する
      return addCourseToLane(newCourse.id)
    } catch (error) {
      const appError = createAppError(error, ErrorCode.DATA_VALIDATION_ERROR)
      logger.error(appError.getMessage())
      return errorResult(appError)
    }
  }

  // 既存講座IDの有無で処理を分岐
  switch (!!selectedCourseId) {
    case true:
      // 既存の講座をレーンに追加する
      return addCourseToLane(selectedCourseId)
    case false:
      // 新しい講座を作成してレーンに追加する
      return createCourseAndAddToLane(subjectId, courseName, instructorIds)
  }
}
