import { NextRequest, NextResponse } from 'next/server'
import { executeOptimization } from './service'

/**
 * 年次時間割最適化エンドポイント
 *
 * 1. Spring GraphQL APIから全データ取得（年次データ + 制約定義）
 * 2. FastAPI形式に変換
 * 3. FastAPI最適化API呼び出し
 * 4. 結果を返却
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json()
    const { ttid } = body as {
      ttid: string
    }

    if (!ttid) {
      return NextResponse.json(
        { success: false, error: 'ttid is required' },
        { status: 400 }
      )
    }

    // 最適化を実行
    const result = await executeOptimization(ttid)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      timetableResultId: result.timetableResultId,
    })
  } catch (error) {
    console.error('Optimization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
