// 時間割結果作成更新
export const UPSERT_TIMETABLE_RESULTS = `
  mutation UpsertTimetableResults($input: UpsertTimetableResultsInput!) {
    upsertTimetableResults(input: $input) {
      id
      ttid
    }
  }
`
