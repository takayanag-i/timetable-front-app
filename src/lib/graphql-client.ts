import { NextResponse } from 'next/server'

const BACKEND_GRAPHQL_URL = 'http://host.docker.internal:8080/graphql'
const BACKEND_API_KEY = 'your-api-key-here' // Optional: for future auth

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
 * @param request GraphQLリクエスト
 * @returns GraphQLレスポンス
 */
export async function executeGraphQL<T = Record<string, unknown>>(
  request: GraphQLRequest
): Promise<GraphQLResponse<T>> {
  const response = await fetch(BACKEND_GRAPHQL_URL, {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

/**
 * GraphQLレスポンスを検証し、エラーがあればNextResponseのエラーレスポンスを返す
 * @param result GraphQLレスポンス
 * @param dataFieldName データフィールド名（例: 'homerooms', 'schoolDays'）
 * @returns エラーレスポンス または null（エラーなし）
 */
export function validateGraphQLResponse<T>(
  result: GraphQLResponse<T>,
  dataFieldName?: string
): NextResponse | null {
  // GraphQLエラーのチェック
  if (result.errors && result.errors.length > 0) {
    return NextResponse.json(
      {
        error: 'GraphQLクエリのエラーが発生しました',
        details: result.errors,
      },
      { status: 400 }
    )
  }

  // dataの存在確認
  if (!result.data) {
    return NextResponse.json(
      { error: 'GraphQLレスポンスのdataが存在しません' },
      { status: 500 }
    )
  }

  // 指定されたデータフィールドの存在確認
  if (dataFieldName && !result.data[dataFieldName as keyof T]) {
    return NextResponse.json(
      { error: `GraphQLレスポンスの${dataFieldName}が存在しません` },
      { status: 500 }
    )
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
 * @param error エラーメッセージ
 * @param status HTTPステータスコード
 * @returns NextResponse
 */
export function createErrorResponse(
  error: string,
  status: number = 500
): NextResponse {
  return NextResponse.json({ error }, { status })
}

/**
 * GraphQLリクエストを実行し、適切なNextResponseを返す
 * @param request GraphQLリクエスト
 * @param dataFieldName データフィールド名
 * @param errorMessage エラー時のメッセージ
 * @returns NextResponse
 */
export async function executeGraphQLRequest<T = Record<string, unknown>>(
  request: GraphQLRequest,
  dataFieldName?: string,
  errorMessage: string = '不明なエラーが発生しました'
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
    console.error(errorMessage, error)

    // HTTPエラーの場合
    if (error instanceof Error && error.message.startsWith('HTTP')) {
      const statusMatch = error.message.match(/HTTP (\d+)/)
      const status = statusMatch ? parseInt(statusMatch[1]) : 502
      return createErrorResponse('内部APIからエラーが返却されました', status)
    }

    return createErrorResponse(errorMessage)
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
 * エラー時もエラー詳細を含む結果を返すため、呼び出し側で適切にエラーハンドリング可能
 * @param request GraphQLリクエスト
 * @param dataFieldName データフィールド名
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
      const errorMessages = result.errors.map(err => err.message).join(', ')
      console.error('GraphQLエラー:', result.errors)
      return {
        success: false,
        error: errorMessages,
      }
    }

    // dataの存在確認
    if (!result.data) {
      console.error('GraphQLレスポンスのdataが存在しません')
      return {
        success: false,
        error: 'GraphQLレスポンスのdataが存在しません',
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
    console.error('GraphQL実行エラー:', error)
    if (error instanceof Error) {
      // fetchエラーの場合、より詳細な情報を提供
      if (error.message.includes('fetch')) {
        return {
          success: false,
          error:
            'バックエンドへの接続に失敗しました。バックエンドサーバーが起動しているか確認してください。',
        }
      }
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: '不明なエラーが発生しました',
    }
  }
}

/**
 * Server Actions用: GraphQL Mutationを実行
 * @param request GraphQLリクエスト
 * @param dataFieldName データフィールド名
 * @returns 実行結果（success、data、errorを含む）
 */
export async function executeGraphQLMutation<T = Record<string, unknown>>(
  request: GraphQLRequest,
  dataFieldName?: string
): Promise<GraphQLExecutionResult<T>> {
  return executeGraphQLForServerAction<T>(request, dataFieldName)
}
