// GraphQLクエリ定義

export const FETCH_HOMEROOM = `
  query FetchHomeroom($input: RetrieveHomeroomsInput!) {
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
    }
  }
`

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

export const FETCH_COURSE_DETAILS = `
  query FetchCourseDetails($input: RetrieveCoursesInput!) {
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

export const FETCH_LANES = `
  query FetchLanes($input: RetrieveLanesInput!) {
    lanes(input: $input) {
      id
      courses {
        id
      }
    }
  }
`

// 複合クエリ: 学級一覧と学年一覧を同時に取得（リクエスト数削減）
export const FETCH_HOMEROOMS_AND_GRADES = `
  query FetchHomeroomsAndGrades($homeroomsInput: RetrieveHomeroomsInput!, $gradesInput: RetrieveGradesInput!) {
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
              credits
            }
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
      }
    }
    grades(input: $gradesInput) {
      id
      gradeName
    }
  }
`

// 複合クエリ: 科目・教員・講座を同時に取得（リクエスト数削減）
export const FETCH_COURSE_MODAL_OPTIONS = `
  query FetchCourseModalOptions($subjectsInput: RetrieveSubjectsInput!, $instructorsInput: RetrieveInstructorsInput!, $coursesInput: RetrieveCoursesInput!) {
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
