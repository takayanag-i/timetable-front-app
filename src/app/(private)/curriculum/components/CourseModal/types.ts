/**
 * CourseModal で扱うフォーム値
 */
export interface CourseFormValues {
  subjectId: string
  courseName: string
  courseDetails: { instructorId: string }[]
}

/**
 * 講座モーダル用オプション
 */
export interface CourseModalOptions {
  subjects: CourseModalSubject[]
  instructors: CourseModalInstructor[]
  courses: CourseModalCourse[]
}

/**
 * CourseModal用の科目型
 */
export interface CourseModalSubject {
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
 * CourseModal用の教員型
 */
export interface CourseModalInstructor {
  id: string
  instructorName: string
  disciplineCode: string
}

/**
 * CourseModal用の講座型
 */
export interface CourseModalCourse {
  id: string
  courseName: string
  subjectId: string
  instructorIds: string[]
  instructorNames: string[]
}
