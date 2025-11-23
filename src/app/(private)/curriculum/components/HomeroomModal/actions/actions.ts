'use server'

import { revalidatePath } from 'next/cache'
import { HomeroomDay, Homeroom } from '@/core/domain/entity'
import { ActionResult, HomeroomData } from '@/types/bff-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import {
  executeGraphQLForServerAction,
  executeGraphQLMutation,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { GET_HOMEROOMS } from '@/lib/graphql/queries'
import { UPSERT_HOMEROOMS, DELETE_HOMEROOM } from '@/lib/graphql/mutations'

export async function fetchHomeroom(
  _prevState: ActionResult<Homeroom> | null,
  formData: FormData
): Promise<ActionResult<Homeroom>> {
  const id = formData.get('homeroomId') as string

  if (!id) {
    return errorResult('学級IDが指定されていません')
  }

  console.log('DEBUG: 学級取得Server Actionが実行されました')

  try {
    // 特定の学級を取得（idのみで検索）
    const result = await executeGraphQLForServerAction<Homeroom[]>(
      {
        query: GET_HOMEROOMS,
        variables: {
          input: {
            id,
          },
        },
      },
      'homerooms'
    )

    if (!result.success || !result.data || result.data.length === 0) {
      return errorResult(
        `学級の取得に失敗しました: ${result.error || '学級が見つかりませんでした'}`
      )
    }

    return successResult(result.data[0])
  } catch (error) {
    console.error('Error fetching homeroom:', error)
    return errorResult(
      error instanceof Error ? error.message : '学級の取得に失敗しました'
    )
  }
}

/**
 * 学級を作成または更新するServer Action
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

    let homeroomDays: HomeroomDay[] = []
    if (homeroomDaysData) {
      try {
        homeroomDays = JSON.parse(homeroomDaysData)
      } catch (e) {
        console.error('Invalid homeroomDays JSON:', e)
        return errorResult('学級曜日データの形式が正しくありません')
      }
    }

    const ttid = getDefaultTtid()

    const sanitizedHomeroomDays = homeroomDays.map(day => ({
      ...(day.id ? { id: day.id } : {}),
      dayOfWeek: day.dayOfWeek,
      periods: day.periods,
    }))

    console.log('DEBUG createHomeroom variables', {
      ttid,
      payload: {
        ...(id && { id }),
        homeroomName,
        gradeId,
        homeroomDays: sanitizedHomeroomDays,
      },
    })

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
      return errorResult(
        `学級の作成・更新に失敗しました: ${result.error || '不明なエラー'}`
      )
    }

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult(result.data)
  } catch (error) {
    console.error('Error creating/updating homeroom:', error)
    return errorResult(
      error instanceof Error ? error.message : '不明なエラーが発生しました'
    )
  }
}

/**
 * 学級を更新するServer Action
 */
export async function updateHomeroom(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const id = formData.get('id') as string
    const homeroomName = formData.get('homeroomName') as string
    const homeroomDaysData = formData.get('homeroomDays') as string
    const gradeId = formData.get('gradeId') as string

    if (!id) {
      return errorResult('学級IDが見つかりません')
    }

    if (!homeroomName?.trim()) {
      return errorResult('学級名を入力してください')
    }

    if (!gradeId?.trim()) {
      return errorResult('学年を選択してください')
    }

    let homeroomDays: HomeroomDay[] = []
    if (homeroomDaysData) {
      try {
        homeroomDays = JSON.parse(homeroomDaysData)
      } catch (e) {
        console.error('Invalid homeroomDays JSON:', e)
        return errorResult('学級曜日データの形式が正しくありません')
      }
    }

    const ttid = getDefaultTtid()

    const sanitizedHomeroomDays = homeroomDays.map(day => ({
      ...(day.id ? { id: day.id } : {}),
      dayOfWeek: day.dayOfWeek,
      periods: day.periods,
    }))

    console.log('DEBUG updateHomeroom variables', {
      ttid,
      payload: {
        id,
        homeroomName,
        gradeId,
        homeroomDays: sanitizedHomeroomDays,
      },
    })

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
                id,
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
      return errorResult(
        `学級の更新に失敗しました: ${result.error || '不明なエラー'}`
      )
    }

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult(result.data)
  } catch (error) {
    console.error('Error updating homeroom:', error)
    return errorResult(
      error instanceof Error ? error.message : '不明なエラーが発生しました'
    )
  }
}

/**
 * 学級を削除するServer Action
 */
export async function deleteHomeroom(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const id = formData.get('id') as string

    if (!id) {
      return errorResult('学級IDが見つかりません')
    }

    const result = await executeGraphQLMutation<boolean>(
      {
        query: DELETE_HOMEROOM,
        variables: {
          id,
        },
      },
      'deleteHomeroom'
    )

    if (!result.success || !result.data) {
      return errorResult(
        `学級の削除に失敗しました: ${result.error || '不明なエラー'}`
      )
    }

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult({ message: '学級を削除しました' })
  } catch (error) {
    console.error('Error deleting homeroom:', error)
    return errorResult(
      error instanceof Error ? error.message : '不明なエラーが発生しました'
    )
  }
}
