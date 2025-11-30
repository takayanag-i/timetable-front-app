import { NextRequest, NextResponse } from 'next/server'
import { executeGraphQL } from '@/lib/graphql-client'
import { optimizeAnnualTimetable } from '@/lib/fastapi-client'
import { convertGraphQLToFastAPI } from '@/lib/optimization-helpers'
import { GET_ANNUAL_DATA_WITH_CONSTRAINTS } from '@/lib/graphql/queries'
import type {
  GraphQLAnnualData,
  ConstraintDefinition,
} from '@/lib/optimization-helpers'
import type { ConstraintDefinitionResponse } from '@/types/graphql-types'

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

    // 1. Spring GraphQL APIから全データを取得（年次データ + 制約定義）
    const graphqlResult = await executeGraphQL<{
      schoolDays: GraphQLAnnualData['schoolDays']
      homerooms: GraphQLAnnualData['homerooms']
      instructors: GraphQLAnnualData['instructors']
      rooms: GraphQLAnnualData['rooms']
      subjects: Array<{
        id: string
        courses: GraphQLAnnualData['courses']
      }>
      constraintDefinitions: ConstraintDefinitionResponse[]
    }>({
      query: GET_ANNUAL_DATA_WITH_CONSTRAINTS,
      variables: { ttid },
    })

    // GraphQLエラーチェック
    if (graphqlResult.errors || !graphqlResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch data from Spring API',
          details: graphqlResult.errors,
        },
        { status: 500 }
      )
    }

    // 講座データを平坦化
    const courses = graphqlResult.data.subjects.flatMap(
      subject => subject.courses
    )

    const annualData: GraphQLAnnualData = {
      schoolDays: graphqlResult.data.schoolDays,
      homerooms: graphqlResult.data.homerooms,
      instructors: graphqlResult.data.instructors,
      rooms: graphqlResult.data.rooms,
      courses,
    }

    // 制約定義をFastAPI形式に変換
    const constraintDefinitions: ConstraintDefinition[] =
      graphqlResult.data.constraintDefinitions.map(cd => {
        // parametersをConstraintParameterの配列に変換
        let parameters: Array<{ key: string; value: string }> | undefined
        if (cd.parameters) {
          if (typeof cd.parameters === 'object' && cd.parameters !== null) {
            if (Array.isArray(cd.parameters)) {
              parameters = cd.parameters as Array<{
                key: string
                value: string
              }>
            } else {
              // オブジェクトの場合は配列に変換
              parameters = Object.entries(cd.parameters).map(
                ([key, value]) => ({
                  key,
                  value: String(value),
                })
              )
            }
          }
        }

        return {
          constraintDefinitionCode: cd.constraintDefinitionCode,
          softFlag: cd.softFlag,
          penaltyWeight: cd.penaltyWeight ?? undefined,
          parameters,
        }
      })

    // 2. FastAPI形式に変換
    const fastapiInput = convertGraphQLToFastAPI(
      annualData,
      ttid,
      constraintDefinitions
    )

    // 3. FastAPI最適化APIを呼び出し
    const optimizationResult = await optimizeAnnualTimetable(fastapiInput)

    // 4. 結果を返却
    return NextResponse.json({
      success: true,
      data: optimizationResult,
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
