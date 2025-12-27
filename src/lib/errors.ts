/**
 * エラーハンドリングユーティリティ
 *
 * 統一的なエラーコードとエラーメッセージを提供します。
 */

/**
 * エラーコード定義
 */
export enum ErrorCode {
  // ネットワークエラー
  NETWORK_ERROR = 'NETWORK_ERROR',
  FETCH_ERROR = 'FETCH_ERROR',

  // GraphQLエラー
  GRAPHQL_ERROR = 'GRAPHQL_ERROR',
  GRAPHQL_VALIDATION_ERROR = 'GRAPHQL_VALIDATION_ERROR',

  // データエラー
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  DATA_VALIDATION_ERROR = 'DATA_VALIDATION_ERROR',
  DATA_PARSING_ERROR = 'DATA_PARSING_ERROR',

  // ビジネスロジックエラー
  OPTIMIZATION_ERROR = 'OPTIMIZATION_ERROR',
  CONSTRAINT_ERROR = 'CONSTRAINT_ERROR',

  // 認証・認可エラー
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // サーバーエラー
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // 不明なエラー
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * エラーメッセージマッピング
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: 'ネットワークエラーが発生しました',
  [ErrorCode.FETCH_ERROR]: 'データの取得に失敗しました',
  [ErrorCode.GRAPHQL_ERROR]: 'GraphQLクエリのエラーが発生しました',
  [ErrorCode.GRAPHQL_VALIDATION_ERROR]: 'GraphQLリクエストの検証に失敗しました',
  [ErrorCode.DATA_NOT_FOUND]: 'データが見つかりませんでした',
  [ErrorCode.DATA_VALIDATION_ERROR]: 'データの検証に失敗しました',
  [ErrorCode.DATA_PARSING_ERROR]: 'データの解析に失敗しました',
  [ErrorCode.OPTIMIZATION_ERROR]: '最適化処理に失敗しました',
  [ErrorCode.CONSTRAINT_ERROR]: '制約の処理に失敗しました',
  [ErrorCode.UNAUTHORIZED]: '認証が必要です',
  [ErrorCode.FORBIDDEN]: 'アクセスが拒否されました',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'サーバー内部エラーが発生しました',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'サービスが利用できません',
  [ErrorCode.UNKNOWN_ERROR]: '予期しないエラーが発生しました',
}

/**
 * デフォルトのエラーメッセージ（エラーメッセージが不明な場合）
 */
export const UNKNOWN_ERROR_MESSAGE = '不明なエラー'

/**
 * アプリケーションエラークラス
 */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message?: string,
    public readonly details?: unknown
  ) {
    super(message || ERROR_MESSAGES[code])
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }

  /**
   * エラーメッセージを取得
   */
  getMessage(): string {
    return this.message || ERROR_MESSAGES[this.code]
  }

  /**
   * エラーオブジェクトに変換
   */
  toJSON(): {
    code: ErrorCode
    message: string
    details?: unknown
  } {
    const result: {
      code: ErrorCode
      message: string
      details?: unknown
    } = {
      code: this.code,
      message: this.getMessage(),
    }
    if (this.details) {
      result.details = this.details
    }
    return result
  }
}

/**
 * エラーからAppErrorを作成
 */
export function createAppError(
  error: unknown,
  defaultCode: ErrorCode = ErrorCode.UNKNOWN_ERROR
): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    // ネットワークエラーの判定
    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    ) {
      return new AppError(ErrorCode.NETWORK_ERROR, error.message)
    }

    // HTTPエラーの判定
    const httpMatch = error.message.match(/HTTP (\d+)/)
    if (httpMatch) {
      const status = parseInt(httpMatch[1])
      if (status === 401) {
        return new AppError(ErrorCode.UNAUTHORIZED, error.message)
      }
      if (status === 403) {
        return new AppError(ErrorCode.FORBIDDEN, error.message)
      }
      if (status >= 500) {
        return new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message)
      }
      if (status >= 400) {
        return new AppError(ErrorCode.DATA_VALIDATION_ERROR, error.message)
      }
    }

    return new AppError(defaultCode, error.message)
  }

  return new AppError(defaultCode, String(error))
}

/**
 * GraphQLエラーからAppErrorを作成
 */
export function createGraphQLError(
  errors: Array<{ message: string; path?: string[] }>
): AppError {
  const messages = errors.map(err => err.message).join(', ')
  return new AppError(ErrorCode.GRAPHQL_ERROR, messages, { errors })
}
