'use server'

import { ActionResult } from '@/types/bff-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation } from '@/lib/graphql-client'
import { DELETE_BLOCK } from '@/lib/graphql/mutations'
import { revalidatePath } from 'next/cache'

/**
 * ブロックを削除するServer Action
 */
export async function deleteBlock(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const blockId = formData.get('blockId') as string

  if (!blockId?.trim()) {
    return errorResult('ブロックIDが指定されていません')
  }

  try {
    const result = await executeGraphQLMutation<boolean>(
      {
        query: DELETE_BLOCK,
        variables: {
          id: blockId,
        },
      },
      'deleteBlock'
    )

    if (!result.success) {
      return errorResult(
        `ブロックの削除に失敗しました: ${result.error || '不明なエラー'}`
      )
    }

    revalidatePath('/curriculum')
    return successResult({ message: 'ブロックを削除しました' })
  } catch (error) {
    console.error('Error deleting block:', error)
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return errorResult(
          'バックエンドへの接続に失敗しました。バックエンドサーバーが起動しているか確認してください。'
        )
      }
      return errorResult(`エラー: ${error.message}`)
    }
    return errorResult('ブロックの削除に失敗しました')
  }
}
