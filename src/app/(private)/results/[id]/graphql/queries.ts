// 時間割結果取得
export const GET_TIMETABLE_RESULTS = `
  query GetTimetableResults($input: RetrieveTimetableResultsInput!, $schoolDaysInput: RetrieveSchoolDaysInput!) {
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
    schoolDays(input: $schoolDaysInput) {
      id
      ttid
      dayOfWeek
      isAvailable
      amPeriods
      pmPeriods
    }
  }
`
