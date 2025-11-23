// Server Actions用のヘルパー関数
import type { ActionResult } from '@/types/bff-types'

/**
 * 成功結果を作成
 */
export function successResult<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

/**
 * エラー結果を作成
 */
export function errorResult(error: string): ActionResult<never> {
  return { success: false, error }
}

/**
 * Server ActionでのAPI呼び出しを簡略化
 * @deprecated 現在はServer ActionsからGraphQLを直接呼び出すため使用されていません
 * @param url APIエンドポイント
 * @param options fetchオプション
 * @returns ActionResult
 */
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<ActionResult<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return errorResult(errorData.error || `APIエラー: ${response.status}`)
    }

    const data = await response.json()
    return successResult(data)
  } catch (error) {
    console.error('Fetch error:', error)
    return errorResult(
      error instanceof Error ? error.message : '予期しないエラーが発生しました'
    )
  }
}
