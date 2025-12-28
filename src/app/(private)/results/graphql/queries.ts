// 時間割結果一覧取得
export const GET_TIMETABLE_RESULTS_LIST = `
  query GetTimetableResultsList($input: RetrieveTimetableResultsInput!) {
    timetableResults(input: $input) {
      id
      ttid
    }
  }
`
