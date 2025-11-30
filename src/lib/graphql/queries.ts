// GraphQLクエリ定義

export const GET_HOMEROOMS = `
  query GetHomerooms($input: RetrieveHomeroomsInput!) {
    homerooms(input: $input) {
      id
      homeroomName
      grade {
        id
        gradeName
      }
      homeroomDays {
        id
        dayOfWeek
        periods
      }
      blocks {
        id
        blockName
        lanes {
          id
          courses {
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
      }
    }
  }
`

export const GET_SCHOOL_DAYS = `
  query GetSchoolDays($ttid: UUID!) {
    schoolDays(input: { ttid: $ttid }) {
      id
      dayOfWeek
      amPeriods
      pmPeriods
      isAvailable
    }
  }
`

export const GET_SUBJECTS = `
  query GetSubjects($ttid: UUID!) {
    subjects(input: { ttid: $ttid }) {
      id
      subjectName
      discipline {
        disciplineCode
        disciplineName
      }
      credits
      grade {
        id
        gradeName
      }
    }
  }
`

export const GET_INSTRUCTORS = `
  query GetInstructors($ttid: UUID!) {
    instructors(input: { ttid: $ttid }) {
      id
      instructorName
      disciplineCode
    }
  }
`

export const GET_COURSES = `
  query GetCourses($ttid: UUID!) {
    courses(input: { ttid: $ttid }) {
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
          disciplineCode
        }
        room {
          id
          roomName
        }
      }
    }
  }
`

export const GET_COURSE_WITH_SUBJECT = `
  query GetCourseWithSubject($input: RetrieveCoursesInput!) {
    courses(input: $input) {
      id
      courseName
      subject {
        id
        subjectName
        grade {
          id
          gradeName
        }
        discipline {
          disciplineCode
          disciplineName
        }
      }
      courseDetails {
        instructor {
          id
          instructorName
          disciplineCode
        }
        room {
          id
          roomName
        }
      }
    }
  }
`

export const GET_LANES = `
  query GetLanes($input: RetrieveLanesInput!) {
    lanes(input: $input) {
      id
      courses {
        id
      }
    }
  }
`

export const GET_GRADES = `
  query GetGrades($input: RetrieveGradesInput!) {
    grades(input: $input) {
      id
      gradeName
    }
  }
`

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
      homeroomName
      homeroomDays {
        id
        dayOfWeek
        periods
      }
      blocks {
        id
        blockName
        lanes {
          id
          courses {
            id
            courseName
          }
        }
      }
    }
    instructors(input: { ttid: $ttid }) {
      id
      instructorName
      attendanceDays {
        id
        dayOfWeek
        unavailablePeriods
      }
    }
    rooms(input: { ttid: $ttid }) {
      id
      roomName
    }
    subjects(input: { ttid: $ttid }) {
      id
      subjectName
      credits
      courses {
        id
        courseName
        courseDetails {
          id
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
    constraintDefinitions(input: { ttid: $ttid }) {
      id
      constraintDefinitionCode
      softFlag
      penaltyWeight
      parameters
    }
  }
`

// 複合クエリ: 学級一覧と学年一覧を同時に取得（リクエスト数削減）
export const GET_HOMEROOMS_AND_GRADES = `
  query GetHomeroomsAndGrades($homeroomsInput: RetrieveHomeroomsInput!, $gradesInput: RetrieveGradesInput!) {
    homerooms(input: $homeroomsInput) {
      id
      homeroomName
      grade {
        id
        gradeName
      }
      homeroomDays {
        id
        dayOfWeek
        periods
      }
      blocks {
        id
        blockName
        lanes {
          id
          courses {
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
      }
    }
    grades(input: $gradesInput) {
      id
      gradeName
    }
  }
`

// 複合クエリ: 科目・教員・講座を同時に取得（リクエスト数削減）
export const GET_COURSE_MODAL_OPTIONS = `
  query GetCourseModalOptions($ttid: UUID!, $coursesInput: RetrieveCoursesInput!) {
    subjects(input: { ttid: $ttid }) {
      id
      subjectName
      discipline {
        disciplineCode
        disciplineName
      }
      credits
      grade {
        id
        gradeName
      }
    }
    instructors(input: { ttid: $ttid }) {
      id
      instructorName
      disciplineCode
    }
    courses(input: $coursesInput) {
      id
      courseName
      subject {
        id
        subjectName
        grade {
          id
          gradeName
        }
        discipline {
          disciplineCode
          disciplineName
        }
      }
      courseDetails {
        instructor {
          id
          instructorName
          disciplineCode
        }
        room {
          id
          roomName
        }
      }
    }
  }
`
