import { useMemo } from 'react'
import type { CourseModalCourse } from '../types'

interface UseCourseSuggestionsArgs {
  courses: CourseModalCourse[]
  subjectId: string | undefined
  courseName: string
}

/**
 * 講座サジェストコンポーネントのカスタムフック
 */
export function useCourseSuggestions({
  courses,
  subjectId,
  courseName,
}: UseCourseSuggestionsArgs) {
  // 選択中の講座が属する科目の講座リスト
  const coursesInSelectedSubject = useMemo(() => {
    if (!subjectId) return []
    return courses.filter(course => course.subjectId === subjectId)
  }, [courses, subjectId])

  // 完全一致する講座
  const exactMatchCourse = useMemo(() => {
    if (!subjectId) return null
    const keyword = courseName.trim().toLowerCase()
    if (keyword.length === 0) return null

    return (
      coursesInSelectedSubject.find(
        course => course.courseName.toLowerCase() === keyword
      ) || null
    )
  }, [coursesInSelectedSubject, courseName, subjectId])

  // サジェストされる講座リスト
  const suggestedCourses = useMemo(() => {
    if (!subjectId) return []
    // 講座名をキーワードにする
    const keyword = courseName.trim().toLowerCase()

    // 空の場合はサジェストしない
    if (keyword.length === 0) return coursesInSelectedSubject

    // 完全一致する講座がある場合は、その1件だけを返却
    if (exactMatchCourse) return [exactMatchCourse]

    // 部分一致する講座リストを返却
    return coursesInSelectedSubject.filter(course =>
      course.courseName.toLowerCase().includes(keyword)
    )
  }, [coursesInSelectedSubject, courseName, subjectId, exactMatchCourse])

  return {
    coursesInSelectedSubject,
    suggestedCourses,
    exactMatchCourse,
  }
}
