/**
 * 環境変数の型安全な管理
 *
 * 環境変数の取得とバリデーションを行います。
 */

/**
 * 環境変数の型定義
 */
interface Env {
  NODE_ENV: 'development' | 'production' | 'test'
  INT_API_URL: string
  INT_API_KEY?: string
  ENABLE_LOGGING?: string
  ENABLE_API_LOGGING?: string
}

/**
 * 環境変数を取得（型安全）
 */
function getEnv(): Env {
  const nodeEnv = (process.env.NODE_ENV || 'development') as Env['NODE_ENV']

  const intApiUrl =
    process.env.INT_API_URL || 'http://host.docker.internal:8080'

  return {
    NODE_ENV: nodeEnv,
    INT_API_URL: intApiUrl,
    INT_API_KEY: process.env.INT_API_KEY,
    ENABLE_LOGGING: process.env.ENABLE_LOGGING,
    ENABLE_API_LOGGING: process.env.ENABLE_API_LOGGING,
  }
}

/**
 * 環境変数のシングルトンインスタンス
 */
export const env = getEnv()

/**
 * 開発環境かどうか
 */
export const isDevelopment = env.NODE_ENV === 'development'

/**
 * 本番環境かどうか
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * テスト環境かどうか
 */
export const isTest = env.NODE_ENV === 'test'
