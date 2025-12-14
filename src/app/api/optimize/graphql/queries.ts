// GraphQLクエリ定義

export const GET_ANNUAL_DATA_WITH_CONSTRAINTS = `
  query GetAnnualData($ttid: UUID!) {
    schoolDays(input: { ttid: $ttid }) {
      id
      dayOfWeek
      isAvailable
      amPeriods
      pmPeriods
    }
    homerooms(input: { ttid: $ttid }) {
      id
      homeroomDays {
        id
        dayOfWeek
        periods
      }
      blocks {
        id
        lanes {
          id
          courses {
            id
          }
        }
      }
    }
    instructors(input: { ttid: $ttid }) {
      id
      attendanceDays {
        id
        dayOfWeek
        unavailablePeriods
      }
    }
    rooms(input: { ttid: $ttid }) {
      id
    }
    subjects(input: { ttid: $ttid }) {
      id
      credits
      courses {
        id
        courseDetails {
          id
          instructor {
            id
          }
          room {
            id
          }
        }
      }
    }
    constraintDefinitions(input: { ttid: $ttid }) {
      id
      constraintDefinitionCode
      softFlag
      penaltyWeight
      parameters
    }
  }
`
