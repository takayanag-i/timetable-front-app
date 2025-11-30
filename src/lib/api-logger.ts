/**
 * APIリクエストのロギングユーティリティ
 *
 * 環境変数 ENABLE_API_LOGGING=true でリクエスト内容をJSON全階層でログ出力
 */

// ロギングが有効かどうかを判定
const isLoggingEnabled = (): boolean => {
  return process.env.ENABLE_API_LOGGING === 'true'
}

/**
 * APIリクエストをログ出力する
 * @param endpoint リクエスト先のエンドポイント
 * @param method HTTPメソッド
 * @param body リクエストボディ
 */
export function logApiRequest(
  endpoint: string,
  method: string,
  body?: unknown
): void {
  if (!isLoggingEnabled()) {
    return
  }

  console.log('=== API Request ===')
  console.log(`Endpoint: ${endpoint}`)
  console.log(`Method: ${method}`)
  if (body !== undefined) {
    console.log('Body:')
    console.log(JSON.stringify(body, null, 2))
  }
  console.log('===================')
}

/**
 * APIレスポンスをログ出力する
 * @param endpoint リクエスト先のエンドポイント
 * @param status HTTPステータスコード
 * @param body レスポンスボディ
 */
export function logApiResponse(
  endpoint: string,
  status: number,
  body?: unknown
): void {
  if (!isLoggingEnabled()) {
    return
  }

  console.log('=== API Response ===')
  console.log(`Endpoint: ${endpoint}`)
  console.log(`Status: ${status}`)
  if (body !== undefined) {
    console.log('Body:')
    console.log(JSON.stringify(body, null, 2))
  }
  console.log('====================')
}
