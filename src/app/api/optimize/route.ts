import { NextRequest, NextResponse } from 'next/server'
import { executeGraphQL } from '@/lib/graphql-client'
import { optimizeAnnualTimetable } from '@/lib/fastapi-client'
import { convertGraphQLToFastAPI } from '@/lib/optimization-helpers'
import type {
  GraphQLAnnualData,
  ConstraintDefinition,
} from '@/lib/optimization-helpers'

/**
 * 年次時間割最適化エンドポイント
 *
 * 1. Spring GraphQL APIから全データ取得
 * 2. FastAPI形式に変換
 * 3. FastAPI最適化API呼び出し
 * 4. 結果を返却
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json()
    const { ttid, constraintDefinitions } = body as {
      ttid: string
      constraintDefinitions: ConstraintDefinition[]
    }

    if (!ttid) {
      return NextResponse.json(
        { success: false, error: 'ttid is required' },
        { status: 400 }
      )
    }

    // 1. Spring GraphQL APIから全データを取得
    const graphqlQuery = `
      query GetAnnualData($ttid: UUID!) {
        schoolDays(input: { ttid: $ttid }) {
          id
          dayOfWeek
          isAvailable
          amPeriods
          pmPeriods
        }
        homerooms(input: { ttid: $ttid }) {
          id
          homeroomName
          homeroomDays {
            id
            dayOfWeek
            periods
          }
          blocks {
            id
            blockName
            lanes {
              id
              courses {
                id
                courseName
              }
            }
          }
        }
        instructors(input: { ttid: $ttid }) {
          id
          instructorName
          attendanceDays {
            id
            dayOfWeek
            unavailablePeriods
          }
        }
        rooms(input: { ttid: $ttid }) {
          id
          roomName
        }
        subjects(input: { ttid: $ttid }) {
          id
          subjectName
          credits
          courses {
            id
            courseName
            courseDetails {
              id
              instructor {
                id
                instructorName
              }
              room {
                id
                roomName
              }
            }
          }
        }
      }
    `

    const graphqlResult = await executeGraphQL<{
      schoolDays: GraphQLAnnualData['schoolDays']
      homerooms: GraphQLAnnualData['homerooms']
      instructors: GraphQLAnnualData['instructors']
      rooms: GraphQLAnnualData['rooms']
      subjects: Array<{
        id: string
        courses: GraphQLAnnualData['courses']
      }>
    }>({
      query: graphqlQuery,
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

    // 2. FastAPI形式に変換
    const fastapiInput = convertGraphQLToFastAPI(
      annualData,
      ttid,
      constraintDefinitions || []
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
