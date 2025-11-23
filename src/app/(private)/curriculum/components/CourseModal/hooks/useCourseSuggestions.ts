import { useMemo } from 'react'
import type { CourseModalOptions } from '@/types/ui-types'

interface UseCourseSuggestionsParams {
  subjectId: string
  courses: CourseModalOptions['courses']
  selectedCourseId: string
  courseName: string
}

export function useCourseSuggestions({
  subjectId,
  courses,
  selectedCourseId,
  courseName,
}: UseCourseSuggestionsParams) {
  const coursesInSelectedSubject = useMemo(() => {
    if (!subjectId) return []
    return courses.filter(course => course.subjectId === subjectId)
  }, [courses, subjectId])

  const suggestedCourses = useMemo(() => {
    if (!subjectId) return []
    const keyword = courseName.trim().toLowerCase()
    if (keyword.length === 0) return coursesInSelectedSubject

    // 完全一致する講座がある場合は、その1件だけを返す
    const exactMatch = coursesInSelectedSubject.find(
      course => course.courseName.toLowerCase() === keyword
    )
    if (exactMatch) return [exactMatch]

    // 部分一致する講座を返す
    return coursesInSelectedSubject.filter(course =>
      course.courseName.toLowerCase().includes(keyword)
    )
  }, [coursesInSelectedSubject, courseName, subjectId])

  const selectedCourse = useMemo(() => {
    if (!selectedCourseId) return null
    return (
      coursesInSelectedSubject.find(course => course.id === selectedCourseId) ||
      null
    )
  }, [coursesInSelectedSubject, selectedCourseId])

  return {
    coursesInSelectedSubject,
    suggestedCourses,
    selectedCourse,
  }
}
