import 'server-only' // client componentでimportするとエラーにする

import { Grade, Homeroom } from '@/core/domain/entity'
import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import {
  GET_GRADES,
  GET_HOMEROOMS,
  GET_HOMEROOMS_AND_GRADES,
} from '@/lib/graphql/queries'

// 学級・学年一覧の複合レスポンス型
interface HomeroomsAndGradesResponse {
  homerooms: Homeroom[]
  grades: Grade[]
}

/**
 * 学級一覧と学年一覧を同時に取得（リクエスト数削減）
 * 1回のGraphQLリクエストで両方のデータを取得することで、パフォーマンスを向上
 */
export async function getHomeroomsAndGrades(): Promise<{
  homerooms: Homeroom[]
  grades: Grade[]
}> {
  try {
    const ttid = getDefaultTtid()

    // GraphQLから学級と学年を同時に取得（1リクエスト）
    const result =
      await executeGraphQLForServerAction<HomeroomsAndGradesResponse>(
        {
          query: GET_HOMEROOMS_AND_GRADES,
          variables: {
            homeroomsInput: { ttid },
            gradesInput: { ttid },
          },
        },
        undefined // 複数フィールドを取得するため、dataFieldNameは指定しない
      )

    console.log('DEBUG: 学級・学年一覧取得Server Componentが実行されました')

    if (!result.success || !result.data) {
      console.error(
        `学級・学年一覧取得でエラーが発生しました: ${result.error || '不明なエラー'}`
      )
      return { homerooms: [], grades: [] }
    }

    return {
      homerooms: result.data.homerooms || [],
      grades: result.data.grades || [],
    }
  } catch (error) {
    console.error('学級・学年一覧取得で不明なエラーが発生しました', error)
    return { homerooms: [], grades: [] }
  }
}

export async function getHomerooms(): Promise<Homeroom[]> {
  try {
    const ttid = getDefaultTtid()

    // GraphQLから直接取得
    const result = await executeGraphQLForServerAction<Homeroom[]>(
      {
        query: GET_HOMEROOMS,
        variables: {
          input: {
            ttid,
          },
        },
      },
      'homerooms'
    )

    // デバッグ用ログ
    console.log('DEBUG: 学級一覧取得Server Componentが実行されました')

    if (!result.success || !result.data) {
      console.error(
        `学級一覧取得でエラーが発生しました: ${result.error || '不明なエラー'}`
      )
      return []
    }

    return result.data
  } catch (error) {
    console.error('学級一覧取得で不明なエラーが発生しました', error)

    // フォールバック
    return []
  }
}

export async function getGrades(): Promise<Grade[]> {
  try {
    const ttid = getDefaultTtid()

    const result = await executeGraphQLForServerAction<Grade[]>(
      {
        query: GET_GRADES,
        variables: {
          input: {
            ttid,
          },
        },
      },
      'grades'
    )

    console.log('DEBUG: 学年一覧取得Server Componentが実行されました')

    if (!result.success || !result.data) {
      console.error(
        `学年一覧取得でエラーが発生しました: ${result.error || '不明なエラー'}`
      )
      return []
    }

    return result.data
  } catch (error) {
    console.error('学年一覧取得で不明なエラーが発生しました', error)
    return []
  }
}
