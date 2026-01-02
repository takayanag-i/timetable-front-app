'use server'

import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/server-action-types'
import type { UpsertHomeroomsInput } from '@/app/(private)/curriculum/graphql/types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation, getDefaultTtid } from '@/lib/graphql-client'
import { UPSERT_HOMEROOMS } from '@/app/(private)/curriculum/graphql/mutations'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

/**
 * 学級を更新するServer Action
 *
 * @param _prevState - 前回の状態（未使用）
 * @param formData - フォームデータ（homeroomId, homeroomName, homeroomDays, gradeId）
 * @returns 学級更新結果
 */
export async function updateHomeroom(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const homeroomId = formData.get('homeroomId') as string
    const homeroomName = formData.get('homeroomName') as string
    const gradeId = formData.get('gradeId') as string

    if (!homeroomId) {
      return errorResult('学級IDが見つかりません')
    }

    if (!homeroomName?.trim()) {
      return errorResult('学級名を入力してください')
    }

    if (!gradeId?.trim()) {
      return errorResult('学年を選択してください')
    }

    // homeroomDaysを配列として取得
    const homeroomDayIds = formData
      .getAll('homeroomDayIds')
      .filter((value): value is string => typeof value === 'string')
    const dayOfWeeks = formData
      .getAll('dayOfWeeks')
      .filter((value): value is string => typeof value === 'string')
    const periods = formData
      .getAll('periods')
      .filter((value): value is string => typeof value === 'string')

    if (
      homeroomDayIds.length !== dayOfWeeks.length ||
      homeroomDayIds.length !== periods.length
    ) {
      const appError = createAppError(
        new Error('学級曜日データの配列長が一致しません'),
        ErrorCode.DATA_PARSING_ERROR
      )
      logger.error(appError.getMessage())
      return errorResult(appError)
    }

    const ttid = getDefaultTtid()

    // GraphQL mutation用のhomeroomDaysを構築（空文字列のidは除外）
    const homeroomDays = homeroomDayIds.map((homeroomDayId, index) => {
      const dayOfWeek = dayOfWeeks[index]
      const periodsValue = periods[index]
      const periodsNumber = parseInt(periodsValue, 10)
      if (Number.isNaN(periodsNumber)) {
        const appError = createAppError(
          new Error(`Invalid periods value: ${periodsValue}`),
          ErrorCode.DATA_PARSING_ERROR
        )
        logger.error(appError.getMessage())
        throw appError
      }

      return {
        ...(homeroomDayId ? { id: homeroomDayId } : {}),
        dayOfWeek,
        periods: periodsNumber,
      }
    })

    const input: UpsertHomeroomsInput = {
      ttid,
      by: 'system',
      homerooms: [
        {
          id: homeroomId,
          homeroomName,
          homeroomDays,
          gradeId,
        },
      ],
    }

    const result = await executeGraphQLMutation<
      Array<{ homeroomName: string }>
    >(
      {
        query: UPSERT_HOMEROOMS,
        variables: {
          input,
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
