import { NextResponse } from 'next/server'
import { env } from './env'
import { logger } from './logger'
import {
  AppError,
  ErrorCode,
  createAppError,
  createGraphQLError,
} from './errors'

// GraphQLバックエンドAPIのURL（環境変数から取得、/graphqlは含めない）
const BACKEND_API_URL = env.INT_API_URL

// GraphQLバックエンドAPIの認証キー（環境変数から取得、オプション）
const BACKEND_API_KEY = env.INT_API_KEY || ''

// GraphQLレスポンスの基本型
export interface GraphQLResponse<T = Record<string, unknown>> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{
      line: number
      column: number
    }>
    path?: string[]
  }>
}

// GraphQLリクエストの型
export interface GraphQLRequest {
  query: string
  variables?: Record<string, unknown>
}

/**
 * GraphQLリクエストのヘッダーを作成
 */
function createHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // 認証情報をヘッダに追加
  if (BACKEND_API_KEY) {
    headers['Authorization'] = `Bearer ${BACKEND_API_KEY}`
  }

  return headers
}

/**
 * GraphQLクエリを実行
 *
 * @param request - GraphQLリクエスト
 * @returns GraphQLレスポンス
 * @throws {AppError} ネットワークエラーまたはHTTPエラーが発生した場合
 */
export async function executeGraphQL<T = Record<string, unknown>>(
  request: GraphQLRequest
): Promise<GraphQLResponse<T>> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/graphql`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
      throw createAppError(error, ErrorCode.FETCH_ERROR)
    }

    return response.json()
  } catch (error) {
    logger.error('GraphQL request failed', createAppError(error))
    throw createAppError(error, ErrorCode.NETWORK_ERROR)
  }
}

/**
 * GraphQLレスポンスを検証し、エラーがあればNextResponseのエラーレスポンスを返す
 *
 * @param result - GraphQLレスポンス
 * @param dataFieldName - データフィールド名（例: 'homerooms', 'schoolDays'）
 * @returns エラーレスポンス または null（エラーなし）
 */
export function validateGraphQLResponse<T>(
  result: GraphQLResponse<T>,
  dataFieldName?: string
): NextResponse | null {
  // GraphQLエラーのチェック
  if (result.errors && result.errors.length > 0) {
    const appError = createGraphQLError(result.errors)
    logger.error('GraphQL validation error', appError)
    return NextResponse.json(
      {
        error: appError.toJSON(),
      },
      { status: 400 }
    )
  }

  // dataの存在確認
  if (!result.data) {
    const appError = new AppError(ErrorCode.DATA_NOT_FOUND)
    logger.error('GraphQL response missing data', appError)
    return NextResponse.json({ error: appError.toJSON() }, { status: 500 })
  }

  // 指定されたデータフィールドの存在確認
  if (dataFieldName && !result.data[dataFieldName as keyof T]) {
    const appError = new AppError(ErrorCode.DATA_NOT_FOUND, undefined, {
      field: dataFieldName,
    })
    logger.error('GraphQL response missing field', appError)
    return NextResponse.json({ error: appError.toJSON() }, { status: 500 })
  }

  return null // エラーなし
}

/**
 * 成功レスポンスを作成（キャッシュヘッダー付き）
 * @param data レスポンスデータ
 * @param cacheMaxAge キャッシュ最大時間（秒）
 * @param staleWhileRevalidate stale-while-revalidate時間（秒）
 * @returns NextResponse
 */
export function createSuccessResponse(
  data: unknown,
  cacheMaxAge: number = 300,
  staleWhileRevalidate: number = 600
): NextResponse {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `s-maxage=${cacheMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    },
  })
}

/**
 * エラーレスポンスを作成
 *
 * @param error - エラーメッセージまたはAppError
 * @param status - HTTPステータスコード
 * @returns NextResponse
 */
export function createErrorResponse(
  error: string | AppError,
  status: number = 500
): NextResponse {
  const errorObj =
    error instanceof AppError ? error.toJSON() : { message: error }
  logger.error('API error response', errorObj)
  return NextResponse.json({ error: errorObj }, { status })
}

/**
 * GraphQLリクエストを実行し、適切なNextResponseを返す
 *
 * @param request - GraphQLリクエスト
 * @param dataFieldName - データフィールド名
 * @param errorMessage - エラー時のメッセージ（オプション）
 * @returns NextResponse
 */
export async function executeGraphQLRequest<T = Record<string, unknown>>(
  request: GraphQLRequest,
  dataFieldName?: string,
  errorMessage?: string
): Promise<NextResponse> {
  try {
    const result = await executeGraphQL<T>(request)

    // レスポンス検証
    const errorResponse = validateGraphQLResponse(result, dataFieldName)
    if (errorResponse) {
      return errorResponse
    }

    // データを取得
    const data = dataFieldName
      ? result.data![dataFieldName as keyof T]
      : result.data

    return createSuccessResponse(data)
  } catch (error) {
    const appError = createAppError(error)
    logger.error(errorMessage || 'GraphQL request execution failed', appError)
    return createErrorResponse(appError, 500)
  }
}

/**
 * デフォルトのttidを取得（TODO: 実際のプロダクションでは認証されたユーザーから取得）
 */
export function getDefaultTtid(): string {
  return '550e8400-e29b-41d4-a716-446655440000'
}

/**
 * Server Actions用: GraphQLクエリ/ミューテーション実行結果
 */
export interface GraphQLExecutionResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server Actions用: GraphQLクエリを実行してデータを取得
 *
 * エラー時もエラー詳細を含む結果を返すため、呼び出し側で適切にエラーハンドリング可能
 *
 * @param request - GraphQLリクエスト
 * @param dataFieldName - データフィールド名
 * @returns 実行結果（success、data、errorを含む）
 */
export async function executeGraphQLForServerAction<
  T = Record<string, unknown>,
>(
  request: GraphQLRequest,
  dataFieldName?: string
): Promise<GraphQLExecutionResult<T>> {
  try {
    const result = await executeGraphQL<T>(request)

    // GraphQLエラーのチェック
    if (result.errors && result.errors.length > 0) {
      const appError = createGraphQLError(result.errors)
      logger.error('GraphQL error in server action', appError)
      return {
        success: false,
        error: appError.getMessage(),
      }
    }

    // dataの存在確認
    if (!result.data) {
      const appError = new AppError(ErrorCode.DATA_NOT_FOUND)
      logger.error('GraphQL response missing data in server action', appError)
      return {
        success: false,
        error: appError.getMessage(),
      }
    }

    // データを取得
    const data = dataFieldName
      ? result.data[dataFieldName as keyof T]
      : result.data

    return {
      success: true,
      data: data as T,
    }
  } catch (error) {
    const appError = createAppError(error)
    logger.error('GraphQL execution error in server action', appError)
    return {
      success: false,
      error: appError.getMessage(),
    }
  }
}

/**
 * Server Actions用: GraphQL Mutationを実行
 *
 * @param request - GraphQLリクエスト
 * @param dataFieldName - データフィールド名
 * @returns 実行結果（success、data、errorを含む）
 */
export async function executeGraphQLMutation<T = Record<string, unknown>>(
  request: GraphQLRequest,
  dataFieldName?: string
): Promise<GraphQLExecutionResult<T>> {
  return executeGraphQLForServerAction<T>(request, dataFieldName)
}
