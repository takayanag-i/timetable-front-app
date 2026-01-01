/**
 * 講座詳細（教員情報）
 */
export interface CourseFormCourseDetail {
  instructorId: string
}

/**
 * CourseModal で扱うフォーム値
 */
export interface CourseFormValues {
  courseId: string
  subjectId: string
  courseName: string
  courseDetails: CourseFormCourseDetail[]
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
 * CourseModal用の教科型
 */
export interface CourseModalDiscipline {
  disciplineCode: string
  disciplineName: string
}

/**
 * CourseModal用の学年型
 */
export interface CourseModalGrade {
  id: string
  gradeName: string
}

/**
 * CourseModal用の科目型
 */
export interface CourseModalSubject {
  id: string
  subjectName: string
  discipline: CourseModalDiscipline | null
  grade: CourseModalGrade | null
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
