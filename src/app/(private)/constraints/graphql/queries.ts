// GraphQLクエリ定義

export const GET_CONSTRAINT_DEFINITIONS = `
  query GetConstraintDefinitions($input: RetrieveConstraintDefinitionsInput!) {
    constraintDefinitions(input: $input) {
      id
      ttid
      constraintDefinitionCode
      softFlag
      penaltyWeight
      parameters
    }
  }
`

export const GET_CONSTRAINT_DEFINITION_MASTERS = `
  query GetConstraintDefinitionMasters {
    constraintDefinitionMasters {
      constraintDefinitionCode
      constraintDefinitionName
      description
      mandatoryFlag
      softFlag
      parameterMasters {
        parameterKey
        parameterName
        arrayFlag
        optionList
      }
    }
  }
`
