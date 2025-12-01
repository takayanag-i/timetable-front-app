/**
 * 最適化APIサービス層
 */

import { executeGraphQL } from '@/lib/graphql-client'
import { optimizeAnnualTimetable } from '@/lib/fastapi-client'
import { convertGraphQLToFastAPI } from '@/lib/optimization-helpers'
import { GET_ANNUAL_DATA_WITH_CONSTRAINTS } from '@/lib/graphql/queries'
import type {
  GraphQLAnnualData,
  ConstraintDefinition,
} from '@/lib/optimization-helpers'
import type { OptimizeGraphQLResponse, CourseDto } from '@/lib/optimize-types'
import type { OptimizeResult } from '@/types/bff-types'

/**
 * GraphQL APIから最適化用データを取得
 */
async function fetchOptimizeData(
  ttid: string
): Promise<{ data: OptimizeGraphQLResponse | null; errors?: unknown }> {
  const result = await executeGraphQL<OptimizeGraphQLResponse>({
    query: GET_ANNUAL_DATA_WITH_CONSTRAINTS,
    variables: { ttid },
  })

  return {
    data: result.data ?? null,
    errors: result.errors,
  }
}

/**
 * 講座データを平坦化してCourseDto形式に変換
 */
function flattenCourses(
  subjects: OptimizeGraphQLResponse['subjects']
): CourseDto[] {
  return subjects.flatMap(subject =>
    subject.courses.map(course => ({
      id: course.id,
      credits: course.subject.credits ?? 0,
      courseDetails: course.courseDetails.map(cd => ({
        instructorId: cd.instructor.id,
        roomId: cd.room?.id,
      })),
    }))
  )
}

/**
 * 制約定義をFastAPI形式に変換
 */
function convertConstraintDefinitions(
  constraintDefinitions: OptimizeGraphQLResponse['constraintDefinitions']
): ConstraintDefinition[] {
  return constraintDefinitions.map(cd => {
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
          parameters = Object.entries(cd.parameters).map(([key, value]) => ({
            key,
            value: String(value),
          }))
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
}

/**
 * 年次時間割最適化を実行
 */
export async function executeOptimization(
  ttid: string
): Promise<OptimizeResult> {
  // 1. Spring GraphQL APIから全データを取得
  const graphqlResult = await fetchOptimizeData(ttid)

  // GraphQLエラーチェック
  if (graphqlResult.errors || !graphqlResult.data) {
    return {
      success: false,
      error: 'Failed to fetch data from Spring API',
      details: graphqlResult.errors,
    }
  }

  // 2. 講座データを平坦化してCourseDto形式に変換
  const courses = flattenCourses(graphqlResult.data.subjects)

  const annualData: GraphQLAnnualData = {
    schoolDays: graphqlResult.data.schoolDays,
    homerooms: graphqlResult.data.homerooms,
    instructors: graphqlResult.data.instructors,
    rooms: graphqlResult.data.rooms,
    courses: graphqlResult.data.subjects.flatMap(subject => subject.courses),
  }

  // 3. 制約定義をFastAPI形式に変換
  const constraintDefinitions = convertConstraintDefinitions(
    graphqlResult.data.constraintDefinitions
  )

  // 4. FastAPI形式に変換
  const fastapiInput = convertGraphQLToFastAPI(
    annualData,
    ttid,
    constraintDefinitions
  )

  // 講座データをCourseDto形式で上書き
  fastapiInput.annualData.courses = courses

  // 5. FastAPI最適化APIを呼び出し
  const optimizationResult = await optimizeAnnualTimetable(fastapiInput)

  return {
    success: true,
    data: optimizationResult,
  }
}
