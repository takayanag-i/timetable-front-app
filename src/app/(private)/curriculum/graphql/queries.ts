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
  }
`

// 学級編集用の最小限のクエリ（blocksやcoursesは不要）
export const GET_HOMEROOM_FOR_EDIT = `
  query GetHomeroomForEdit($input: RetrieveHomeroomsInput!) {
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

export const GET_SCHOOL_DAYS = `
  query GetSchoolDays($input: RetrieveSchoolDaysInput!) {
    schoolDays(input: $input) {
      id
      dayOfWeek
      amPeriods
      pmPeriods
      isAvailable
    }
  }
`

export const GET_SUBJECTS = `
  query GetSubjects($input: RetrieveSubjectsInput!) {
    subjects(input: $input) {
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
  query GetInstructors($input: RetrieveInstructorsInput!) {
    instructors(input: $input) {
      id
      instructorName
      disciplineCode
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
export const GET_COURSE_MODAL_OPTIONS = `
  query GetCourseModalOptions($subjectsInput: RetrieveSubjectsInput!, $instructorsInput: RetrieveInstructorsInput!, $coursesInput: RetrieveCoursesInput!) {
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
