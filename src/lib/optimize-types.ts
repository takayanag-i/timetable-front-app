/**
 * 最適化API用の型定義
 */

import type {
  GraphQLAnnualDataType,
  ConstraintDefinitionResponse,
} from '@/lib/graphql/types'

/**
 * GraphQL APIから取得した年次時間割最適化用データの型
 */
export interface OptimiseAnnualTimetableGraphQLResponse {
  schoolDays: GraphQLAnnualDataType['schoolDays']
  homerooms: GraphQLAnnualDataType['homerooms']
  instructors: GraphQLAnnualDataType['instructors']
  rooms: GraphQLAnnualDataType['rooms']
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
