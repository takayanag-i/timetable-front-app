/**
 * 最適化APIサービス層
 */

import { executeGraphQL } from '@/lib/graphql-client'
import {
  optimizeAnnualTimetable,
  type OptimizationResult,
} from '@/lib/fastapi-client'
import { convertGraphQLToFastAPI } from '@/lib/optimization-helpers'
import { GET_ANNUAL_DATA_WITH_CONSTRAINTS } from '@/lib/graphql/queries'
import { UPSERT_TIMETABLE_RESULTS } from '@/lib/graphql/mutations'
import type {
  GraphQLAnnualData,
  ConstraintDefinition,
} from '@/types/graphql-types'
import type { OptimiseAnnualTimetableGraphQLResponse } from '@/lib/optimize-types'
import type { OptimizeResult } from '@/types/bff-types'

/**
 * GraphQL APIから最適化用データを取得
 */
async function fetchOptimizeData(ttid: string): Promise<{
  data: OptimiseAnnualTimetableGraphQLResponse | null
  errors?: unknown
}> {
  const result = await executeGraphQL<OptimiseAnnualTimetableGraphQLResponse>({
    query: GET_ANNUAL_DATA_WITH_CONSTRAINTS,
    variables: { ttid },
  })

  return {
    data: result.data ?? null,
    errors: result.errors,
  }
}

/**
 * 制約定義をFastAPI形式に変換
 */
function convertConstraintDefinitions(
  constraintDefinitions: OptimiseAnnualTimetableGraphQLResponse['constraintDefinitions']
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
 * FastAPIの最適化結果をGraphQL Mutationの入力形式に変換
 */
function convertOptimizationResultToGraphQLInput(
  optimizationResult: OptimizationResult
): {
  timetableEntries: Array<{
    homeroomId: string
    dayOfWeek: string
    period: number
    courseId: string
  }>
  constraintViolations: Array<{
    constraintViolationCode: string
    violatingKeys: unknown
  }>
} {
  return {
    timetableEntries: optimizationResult.entries.map(entry => ({
      homeroomId: entry.homeroom,
      dayOfWeek: entry.day,
      period: entry.period,
      courseId: entry.course,
    })),
    constraintViolations: optimizationResult.violations.map(violation => ({
      constraintViolationCode: violation.violation_code,
      violatingKeys: violation.violation_keys,
    })),
  }
}

/**
 * 最適化結果をGraphQL APIに保存
 */
async function saveTimetableResult(
  ttid: string,
  optimizationResult: OptimizationResult
): Promise<{ id: string } | null> {
  const input = convertOptimizationResultToGraphQLInput(optimizationResult)

  const result = await executeGraphQL<{
    upsertTimetableResults: Array<{ id: string; ttid: string }>
  }>({
    query: UPSERT_TIMETABLE_RESULTS,
    variables: {
      input: {
        ttid,
        timetableResults: [
          {
            timetableEntries: input.timetableEntries,
            constraintViolations: input.constraintViolations,
          },
        ],
        by: 'system', // TODO: 実際のユーザー情報を使用
      },
    },
  })

  if (result.errors || !result.data?.upsertTimetableResults?.[0]) {
    console.error('Failed to save timetable result:', result.errors)
    return null
  }

  return { id: result.data.upsertTimetableResults[0].id }
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

  // 2. GraphQLレスポンスをGraphQLAnnualData形式に変換
  const annualData: GraphQLAnnualData = {
    schoolDays: graphqlResult.data.schoolDays,
    homerooms: graphqlResult.data.homerooms,
    instructors: graphqlResult.data.instructors,
    rooms: graphqlResult.data.rooms,
    subjects: graphqlResult.data.subjects.map(subject => ({
      id: subject.id,
      credits: subject.credits,
      courses: subject.courses.map(course => ({
        id: course.id,
        courseDetails: course.courseDetails.map(cd => ({
          id: cd.id,
          instructor: {
            id: cd.instructor.id,
          },
          room: cd.room ? { id: cd.room.id } : undefined,
        })),
        subject: {
          id: subject.id,
          credits: subject.credits,
        },
      })),
    })),
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

  // 5. FastAPI最適化APIを呼び出し
  const optimizationResult = await optimizeAnnualTimetable(fastapiInput)

  // 6. 最適化結果をGraphQL APIに保存
  const savedResult = await saveTimetableResult(ttid, optimizationResult)

  if (!savedResult) {
    return {
      success: false,
      error: 'Failed to save optimization result to database',
    }
  }

  return {
    success: true,
    data: optimizationResult,
    timetableResultId: savedResult.id,
  }
}
