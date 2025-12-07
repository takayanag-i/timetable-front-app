'use server'

import { ActionResult } from '@/types/server-action-types'
import { errorResult, successResult } from '@/lib/action-helpers'
import { executeGraphQLMutation } from '@/lib/graphql-client'
import { UPSERT_BLOCKS } from '@/lib/graphql/mutations'
import { revalidatePath } from 'next/cache'

/**
 * ブロックを作成して学級に追加するServer Action
 * laneCountを指定することで、ブロック作成時にレーンも自動的に作成される
 */
export async function createBlockAndAddToHomeroom(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const homeroomId = formData.get('homeroomId') as string
  const blockName = formData.get('blockName') as string
  const laneCountStr = formData.get('laneCount') as string
  const laneCount = parseInt(laneCountStr) || 1

  console.log('DEBUG createBlockAndAddToHomeroom - Received:', {
    homeroomId,
    blockName,
    laneCount,
  })

  if (!homeroomId || !blockName?.trim()) {
    return errorResult('学級IDとブロック名を入力してください')
  }

  if (laneCount < 1) {
    return errorResult('レーン数は1以上である必要があります')
  }

  try {
    // ブロックを作成（laneCountを指定することでレーンも自動的に作成される）
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
                homeroomId,
                blockName: blockName.trim(),
                laneCount,
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
        `ブロックの作成に失敗しました: ${result.error || '不明なエラー'}`
      )
    }

    console.log('DEBUG - Created block with lanes:', {
      createdBlocks: result.data,
    })

    // キャッシュを再検証
    revalidatePath('/curriculum')
    return successResult({ message: 'ブロックとレーンを作成しました' })
  } catch (error) {
    console.error('Error creating block:', error)
    if (error instanceof Error) {
      // fetchエラーの場合、より詳細な情報を提供
      if (error.message.includes('fetch')) {
        return errorResult(
          'バックエンドへの接続に失敗しました。バックエンドサーバーが起動しているか確認してください。'
        )
      }
      return errorResult(`エラー: ${error.message}`)
    }
    return errorResult('ブロックの作成に失敗しました')
  }
}
