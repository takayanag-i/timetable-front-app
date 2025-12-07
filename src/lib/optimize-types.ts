/**
 * 最適化API用の型定義
 */

import type { GraphQLAnnualData } from '@/types/graphql-types'
import type { ConstraintDefinitionResponse } from '@/types/graphql-types'

/**
 * GraphQL APIから取得した年次時間割最適化用データの型
 */
export interface OptimiseAnnualTimetableGraphQLResponse {
  schoolDays: GraphQLAnnualData['schoolDays']
  homerooms: GraphQLAnnualData['homerooms']
  instructors: GraphQLAnnualData['instructors']
  rooms: GraphQLAnnualData['rooms']
  subjects: Array<{
    id: string
    credits?: number
    courses: Array<{
      id: string
      courseDetails: Array<{
        id: string
        instructor: {
          id: string
        }
        room?: {
          id: string
        } | null
      }>
    }>
  }>
  constraintDefinitions: ConstraintDefinitionResponse[]
}
