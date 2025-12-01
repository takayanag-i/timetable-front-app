/**
 * 最適化API用の型定義
 */

import type { GraphQLAnnualData } from '@/lib/optimization-helpers'
import type { ConstraintDefinitionResponse } from '@/types/graphql-types'

/**
 * GraphQL APIから取得し、FastAPIへ送信する最適化データの型
 */
export interface OptimizeGraphQLResponse {
  schoolDays: GraphQLAnnualData['schoolDays']
  homerooms: GraphQLAnnualData['homerooms']
  instructors: GraphQLAnnualData['instructors']
  rooms: GraphQLAnnualData['rooms']
  subjects: Array<{
    id: string
    courses: GraphQLAnnualData['courses']
  }>
  constraintDefinitions: ConstraintDefinitionResponse[]
}

/**
 * FastAPI講座DTO（FastAPI側のスキーマと一致）
 */
export interface CourseDto {
  id: string
  credits: number
  courseDetails: CourseDetailDto[]
}

/**
 * FastAPI講座詳細DTO
 */
export interface CourseDetailDto {
  instructorId: string
  roomId?: string
}
