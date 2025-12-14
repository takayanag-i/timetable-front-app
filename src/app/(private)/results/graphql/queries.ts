// GraphQLクエリ定義

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
