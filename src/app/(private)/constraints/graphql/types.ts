// GraphQL型定義 - Constraints関連

// GraphQL API用の制約定義型
export interface ConstraintDefinitionResponse {
  id: string
  ttid: string
  constraintDefinitionCode: string
  softFlag: boolean
  penaltyWeight?: number | null
  parameters?: unknown | null
}

// GraphQL API用の制約定義マスタ型
export interface ConstraintDefinitionMasterResponse {
  constraintDefinitionCode: string
  constraintDefinitionName: string
  description?: string | null
  mandatoryFlag: boolean
  softFlag: boolean
  parameterMasters: ConstraintParameterMasterResponse[]
}

// GraphQL API用の制約パラメータマスタ型
export interface ConstraintParameterMasterResponse {
  parameterKey: string
  parameterName: string
  arrayFlag: boolean
  optionList?: unknown | null
}
