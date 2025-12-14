// CourseModal 専用の型定義

/**
 * UI用の科目型
 */
export interface UISubjectType {
  id: string
  subjectName: string
  credits?: number | null
  discipline?: {
    disciplineCode: string
    disciplineName: string
  }
  grade?: {
    id: string
    gradeName: string
    ttid?: string
  } | null
}

/**
 * UI用の教員型
 */
export interface UIInstructorType {
  id: string
  instructorName: string
  disciplineCode: string
}

/**
 * 講座モーダル用オプション
 */
export interface CourseModalOptions {
  subjects: UISubjectType[]
  instructors: UIInstructorType[]
  courses: {
    id: string
    courseName: string
    subjectId: string
    instructorIds: string[]
    instructorNames: string[]
  }[]
}

/**
 * CourseModal で扱うフォーム値
 */
export interface CourseFormValues {
  subjectId: string
  courseName: string
  courseDetails: { instructorId: string }[]
}
