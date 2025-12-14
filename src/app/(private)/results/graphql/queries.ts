// GraphQLクエリ定義

// 時間割結果一覧取得クエリ（一覧表示用、エントリなし）
export const GET_TIMETABLE_RESULTS_LIST = `
  query GetTimetableResultsList($input: RetrieveTimetableResultsInput!) {
    timetableResults(input: $input) {
      id
      ttid
    }
  }
`

// 時間割結果詳細取得クエリ
export const GET_TIMETABLE_RESULTS = `
  query GetTimetableResults($input: RetrieveTimetableResultsInput!) {
    timetableResults(input: $input) {
      id
      ttid
      timetableEntries {
        id
        homeroom {
          id
          homeroomName
          grade {
            id
            gradeName
          }
        }
        dayOfWeek
        period
        course {
          id
          courseName
          subject {
            id
            subjectName
          }
          courseDetails {
            instructor {
              id
              instructorName
            }
            room {
              id
              roomName
            }
          }
        }
      }
      constraintViolations {
        id
        constraintViolationCode
        violatingKeys
      }
    }
  }
`
