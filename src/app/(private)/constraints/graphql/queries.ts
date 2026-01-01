// GraphQLクエリ定義

export const FETCH_SCHOOL_DAYS = `
  query FetchSchoolDays($input: RetrieveSchoolDaysInput!) {
    schoolDays(input: $input) {
      id
      dayOfWeek
      amPeriods
      pmPeriods
      isAvailable
    }
  }
`

export const GET_COURSES = `
  query GetCourses($input: RetrieveCoursesInput!) {
    courses(input: $input) {
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

// 複合クエリ: 科目・教員・講座を同時に取得（リクエスト数削減）
export const FETCH_COURSE_OPTIONS = `
  query FetchCourseOptions($subjectsInput: RetrieveSubjectsInput!, $instructorsInput: RetrieveInstructorsInput!, $coursesInput: RetrieveCoursesInput!) {
    subjects(input: $subjectsInput) {
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
    instructors(input: $instructorsInput) {
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
