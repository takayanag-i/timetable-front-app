'use server'

import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types/server-action-types'
import type { GraphQLHomeroom } from '@/types/graphql-types'
import type { UpsertHomeroomsInput } from '@/app/(private)/curriculum/graphql/types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation, getDefaultTtid } from '@/lib/graphql-client'
import { UPSERT_HOMEROOMS } from '@/app/(private)/curriculum/graphql/mutations'
import { logger } from '@/lib/logger'
import { createAppError, ErrorCode, UNKNOWN_ERROR_MESSAGE } from '@/lib/errors'

/**
 * 学級を作成するServer Action
 *
 * @param _prevState - 前回の状態
 * @param formData - フォームデータ
 * @returns 学級作成結果
 */
export async function createHomeroom(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const homeroomName = formData.get('homeroomName') as string
    const gradeId = formData.get('gradeId') as string

    if (!homeroomName?.trim()) {
      return errorResult('学級名を入力してください')
    }

    if (!gradeId?.trim()) {
      return errorResult('学年を選択してください')
    }

    // homeroomDaysを配列として取得
    const dayOfWeeks = formData
      .getAll('dayOfWeeks')
      .filter((value): value is string => typeof value === 'string')
    const periods = formData
      .getAll('periods')
      .filter((value): value is string => typeof value === 'string')

    if (dayOfWeeks.length !== periods.length) {
      // 学級曜日データの配列長が一致しない場合
      const appError = createAppError(
        new Error('学級曜日データの配列長が一致しません'),
        ErrorCode.DATA_PARSING_ERROR
      )
      logger.error(appError.getMessage())
      return errorResult(appError)
    }

    const ttid = getDefaultTtid()

    const homeroomDays = dayOfWeeks.map((dayOfWeek, index) => {
      // 時限をパース
      const periodsValue = periods[index]
      const periodsNumber = parseInt(periodsValue, 10)
      if (Number.isNaN(periodsNumber)) {
        // パースエラー
        const appError = createAppError(
          new Error(`Invalid periods value: ${periodsValue}`),
          ErrorCode.DATA_PARSING_ERROR
        )
        logger.error(appError.getMessage())
        throw appError
      }

      return {
        dayOfWeek,
        periods: periodsNumber,
      }
    })

    const input: UpsertHomeroomsInput = {
      ttid,
      by: 'system',
      homerooms: [
        {
          homeroomName,
          homeroomDays,
          gradeId,
        },
      ],
    }

    const result = await executeGraphQLMutation<GraphQLHomeroom[]>(
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
