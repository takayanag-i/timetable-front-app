// GraphQL Mutation定義

export const UPSERT_TIMETABLE_RESULTS = `
  mutation UpsertTimetableResults($input: UpsertTimetableResultsInput!) {
    upsertTimetableResults(input: $input) {
      id
      ttid
    }
  }
`
