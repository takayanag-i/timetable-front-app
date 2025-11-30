import { NextRequest, NextResponse } from 'next/server'
import { executeGraphQL } from '@/lib/graphql-client'
import { optimizeAnnualTimetable } from '@/lib/fastapi-client'
import { convertGraphQLToFastAPI } from '@/lib/optimization-helpers'
import { GET_ANNUAL_DATA_WITH_CONSTRAINTS } from '@/lib/graphql/queries'
import { UPSERT_TIMETABLE_RESULTS } from '@/lib/graphql/mutations'
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

    // 曜日の変換マップ（FastAPI形式 -> GraphQL形式）
    const dayOfWeekMap: Record<string, string> = {
      mon: '月',
      tue: '火',
      wed: '水',
      thu: '木',
      fri: '金',
      sat: '土',
      sun: '日',
    }

    // 4. TimetableResult、TimetableEntries、ConstraintViolationsを1回のリクエストでDBに保存
    // バックエンドのTimetableResultServiceがResult作成時にEntriesとViolationsも一緒に作成するため、
    // 1回のmutationリクエストで全てが同一トランザクションで処理されます
    const resultMutation = await executeGraphQL<{
      upsertTimetableResults: Array<{ id: string }>
    }>({
      query: UPSERT_TIMETABLE_RESULTS,
      variables: {
        input: {
          ttid,
          timetableResults: [
            {
              timetableEntries: optimizationResult.entries.map(entry => ({
                homeroomId: entry.homeroom,
                dayOfWeek: dayOfWeekMap[entry.day] || entry.day, // 英語形式を日本語形式に変換
                period: entry.period,
                courseId: entry.course,
              })),
              constraintViolations: optimizationResult.violations.map(
                violation => ({
                  constraintViolationCode: violation.violation_code,
                  violatingKeys: violation.violation_keys,
                })
              ),
            },
          ],
          by: 'system',
        },
      },
    })

    if (
      resultMutation.errors ||
      !resultMutation.data?.upsertTimetableResults?.[0]
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create TimetableResult with Entries and Violations',
          details: resultMutation.errors,
        },
        { status: 500 }
      )
    }

    const timetableResultId = resultMutation.data.upsertTimetableResults[0].id

    // 7. 結果を返却（結果画面に遷移するためのIDを含める）
    return NextResponse.json({
      success: true,
      data: optimizationResult,
      timetableResultId,
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
