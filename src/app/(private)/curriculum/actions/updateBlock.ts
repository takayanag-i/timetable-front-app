'use server'

import { ActionResult } from '@/types/bff-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation } from '@/lib/graphql-client'
import { UPSERT_BLOCKS } from '@/lib/graphql/mutations'
import { revalidatePath } from 'next/cache'

/**
 * ブロックを更新するServer Action
 */
export async function updateBlock(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const blockId = formData.get('blockId') as string
  const blockName = formData.get('blockName') as string
  const homeroomId = formData.get('homeroomId') as string | null

  if (!blockId?.trim()) {
    return errorResult('ブロックIDが指定されていません')
  }

  if (!blockName?.trim()) {
    return errorResult('ブロック名を入力してください')
  }

  try {
    const result = await executeGraphQLMutation<
      Array<{
        id: string
        blockName: string
      }>
    >(
      {
        query: UPSERT_BLOCKS,
        variables: {
          input: {
            blocks: [
              {
                id: blockId,
                blockName: blockName.trim(),
                ...(homeroomId ? { homeroomId } : {}),
              },
            ],
            by: 'system',
          },
        },
      },
      'upsertBlocks'
    )

    if (!result.success || !result.data || result.data.length === 0) {
      return errorResult(
        `ブロックの更新に失敗しました: ${result.error || '不明なエラー'}`
      )
    }

    revalidatePath('/curriculum')
    return successResult({ message: 'ブロックを更新しました' })
  } catch (error) {
    console.error('Error updating block:', error)
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return errorResult(
          'バックエンドへの接続に失敗しました。バックエンドサーバーが起動しているか確認してください。'
        )
      }
      return errorResult(`エラー: ${error.message}`)
    }
    return errorResult('ブロックの更新に失敗しました')
  }
}
