/**
 * Server Actions用のヘルパー関数
 */
import type { ActionResult } from '@/types/server-action-types'
import { logger } from './logger'
import { createAppError, ErrorCode } from './errors'

/**
 * 成功結果を作成
 *
 * @param data - 成功時のデータ
 * @returns 成功結果
 */
export function successResult<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

/**
 * エラー結果を作成
 *
 * @param error - エラーメッセージまたはAppError
 * @returns エラー結果
 */
export function errorResult(error: string | Error): ActionResult<never> {
  const errorMessage = error instanceof Error ? error.message : error
  return { success: false, error: errorMessage }
}

/**
 * Server ActionでのAPI呼び出しを簡略化
 *
 * @deprecated 現在はServer ActionsからGraphQLを直接呼び出すため使用されていません
 * @param url - APIエンドポイント
 * @param options - fetchオプション
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
      const appError = new Error(
        errorData.error || `APIエラー: ${response.status}`
      )
      logger.error(
        'API fetch error',
        createAppError(appError, ErrorCode.FETCH_ERROR)
      )
      return errorResult(appError)
    }

    const data = await response.json()
    return successResult(data)
  } catch (error) {
    const appError = createAppError(error, ErrorCode.NETWORK_ERROR)
    logger.error('Fetch error', appError)
    return errorResult(appError)
  }
}
