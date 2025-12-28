'use server'

import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/server-action-types'
import type { HomeroomDayType } from '../types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation, getDefaultTtid } from '@/lib/graphql-client'
import { UPSERT_HOMEROOMS } from '@/app/(private)/curriculum/graphql/mutations'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

/**
 * 学級を作成するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @param formData - フォームデータ（id, homeroomName, homeroomDays, gradeId）
 * @returns 学級作成結果
 */
export async function createHomeroom(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const id = formData.get('id') as string
    const homeroomName = formData.get('homeroomName') as string
    const homeroomDaysData = formData.get('homeroomDays') as string
    const gradeId = formData.get('gradeId') as string

    if (!homeroomName?.trim()) {
      return errorResult('学級名を入力してください')
    }

    if (!gradeId?.trim()) {
      return errorResult('学年を選択してください')
    }

    let homeroomDays: HomeroomDayType[] = []
    if (homeroomDaysData) {
      try {
        homeroomDays = JSON.parse(homeroomDaysData)
      } catch (e) {
        const appError = createAppError(
          new Error('Invalid homeroomDays JSON'),
          ErrorCode.DATA_PARSING_ERROR
        )
        logger.error('Invalid homeroomDays JSON', appError)
        return errorResult('学級曜日データの形式が正しくありません')
      }
    }

    const ttid = getDefaultTtid()

    const sanitizedHomeroomDays = homeroomDays.map(day => ({
      ...(day.id ? { id: day.id } : {}),
      dayOfWeek: day.dayOfWeek,
      periods: day.periods,
    }))

    const result = await executeGraphQLMutation<
      Array<{ homeroomName: string }>
    >(
      {
        query: UPSERT_HOMEROOMS,
        variables: {
          input: {
            ttid,
            by: 'system',
            homerooms: [
              {
                ...(id && { id }),
                homeroomName,
                homeroomDays: sanitizedHomeroomDays,
                gradeId,
              },
            ],
          },
        },
      },
      'upsertHomerooms'
    )

    if (!result.success || !result.data) {
      const appError = createAppError(
        new Error(result.error || UNKNOWN_ERROR_MESSAGE),
        ErrorCode.DATA_VALIDATION_ERROR
      )
      logger.error(appError.getMessage())
      return errorResult(appError)
    }

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult(result.data)
  } catch (error) {
    const appError = createAppError(error, ErrorCode.DATA_VALIDATION_ERROR)
    logger.error(appError.getMessage())
    return errorResult(appError)
  }
}
