// GraphQL Mutation定義

export const UPSERT_CONSTRAINT_DEFINITIONS = `
  mutation UpsertConstraintDefinitions($input: UpsertConstraintDefinitionsInput!) {
    upsertConstraintDefinitions(input: $input) {
      id
      ttid
      constraintDefinitionCode
      softFlag
      penaltyWeight
      parameters
    }
  }
`

export const DELETE_CONSTRAINT_DEFINITION = `
  mutation DeleteConstraintDefinition($id: ID!) {
    deleteConstraintDefinition(id: $id)
  }
`
