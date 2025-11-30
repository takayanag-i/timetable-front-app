// GraphQL型定義 - spring/schema.graphqlsと連動
// Server Actionsで使用するGraphQLのInput/Response型を定義

import type {
  HomeroomDay,
  SchoolDay,
  Subject,
  Instructor,
} from '@/core/domain/entity'

// --------------------------------------
// Query Response Types (for optimize API)
// --------------------------------------

// 学校曜日一覧のレスポンス型
export interface SchoolDaysResponse {
  schoolDays: SchoolDay[]
}

// 教員一覧のレスポンス型
export interface InstructorsResponse {
  instructors: Instructor[]
}

// 科目一覧のレスポンス型
export interface SubjectsResponse {
  subjects: Subject[]
}

// --------------------------------------
// Mutation Input Types (for Server Actions)
// --------------------------------------

// 学級作成更新 Input (UpsertHomeroomsInput)
export interface UpsertHomeroomsInput {
  ttid: string
  by: string
  homerooms: {
    id?: string
    homeroomName: string
    gradeId?: string
    homeroomDays: Array<
      Pick<HomeroomDay, 'dayOfWeek' | 'periods'> & { id?: string }
    >
  }[]
}

// --------------------------------------
// ConstraintDefinition Types (for GraphQL API)
// --------------------------------------

// 制約定義 GraphQLレスポンス型
export interface ConstraintDefinitionResponse {
  id: string
  ttid: string
  constraintDefinitionCode: string
  softFlag: boolean
  penaltyWeight?: number | null
  parameters?: unknown | null
}

// 制約定義一覧のレスポンス型
export interface ConstraintDefinitionsResponse {
  constraintDefinitions: ConstraintDefinitionResponse[]
}

// --------------------------------------
// ConstraintDefinitionMaster Types (for GraphQL API)
// --------------------------------------

// 制約定義マスタ GraphQLレスポンス型
export interface ConstraintDefinitionMasterResponse {
  constraintDefinitionCode: string
  constraintDefinitionName: string
  description?: string | null
  mandatoryFlag: boolean
  softFlag: boolean
  parameterMasters: ConstraintParameterMasterResponse[]
}

// 制約定義マスタ一覧のレスポンス型
export interface ConstraintDefinitionMastersResponse {
  constraintDefinitionMasters: ConstraintDefinitionMasterResponse[]
}

// --------------------------------------
// ConstraintParameterMaster Types (for GraphQL API)
// --------------------------------------

// 制約パラメータマスタ GraphQLレスポンス型
export interface ConstraintParameterMasterResponse {
  parameterKey: string
  parameterName: string
  arrayFlag: boolean
  optionList?: unknown | null
}

// 制約パラメータマスタ一覧のレスポンス型
export interface ConstraintParameterMastersResponse {
  constraintParameterMasters: ConstraintParameterMasterResponse[]
}
