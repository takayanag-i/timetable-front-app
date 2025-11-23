import 'server-only' // client componentでimportするとエラーにする

import { Grade, Homeroom } from '@/core/domain/entity'
import {
  executeGraphQLForServerAction,
  getDefaultTtid,
} from '@/lib/graphql-client'
import { GET_GRADES, GET_HOMEROOMS } from '@/lib/graphql/queries'

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
