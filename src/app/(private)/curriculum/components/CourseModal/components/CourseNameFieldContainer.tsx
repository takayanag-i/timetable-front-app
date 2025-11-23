'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CourseModalOptions } from '@/types/ui-types'
import { CourseNameField } from './CourseNameField'

interface CourseNameFieldContainerProps {
  value: string
  subjectId: string
  editMode: boolean
  coursesInSelectedSubject: CourseModalOptions['courses']
  suggestedCourses: CourseModalOptions['courses']
  onNameChange: (value: string) => void
  onSelectExistingCourse: (
    course: CourseModalOptions['courses'][number]
  ) => void
}

export function CourseNameFieldContainer({
  value,
  subjectId,
  editMode,
  coursesInSelectedSubject,
  suggestedCourses,
  onNameChange,
  onSelectExistingCourse,
}: CourseNameFieldContainerProps) {
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false)
  const blurTimeoutRef = useRef<number | null>(null)

  const clearBlurTimeout = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearBlurTimeout()
    }
  }, [])

  useEffect(() => {
    if (suggestedCourses.length === 0) {
      setIsSuggestionVisible(false)
    }
  }, [suggestedCourses.length])

  useEffect(() => {
    if (!subjectId) {
      setIsSuggestionVisible(false)
    }
  }, [subjectId])

  const applyExistingCourseSelection = useCallback(
    (course: CourseModalOptions['courses'][number]) => {
      clearBlurTimeout()
      onSelectExistingCourse(course)
      // ユーザーがサジェストをクリックしたら、サジェストを非表示にする
      setIsSuggestionVisible(false)
    },
    [onSelectExistingCourse]
  )

  const handleCourseNameChange = useCallback(
    (nextValue: string) => {
      const trimmedValue = nextValue.trim()
      const normalizedValue = trimmedValue.toLowerCase()

      const matchedCourse = coursesInSelectedSubject.find(
        course => course.courseName.toLowerCase() === normalizedValue
      )

      // 完全一致の場合は、その1件をサジェストとして表示（自動選択はしない）
      // ユーザーがサジェストをクリックすることを強制する
      if (matchedCourse) {
        onNameChange(nextValue)
        // 完全一致の場合はサジェストを表示（自動選択はしない）
        setIsSuggestionVisible(true)
        return
      }

      const hasSuggestions =
        normalizedValue.length > 0
          ? coursesInSelectedSubject.some(course =>
              course.courseName.toLowerCase().includes(normalizedValue)
            )
          : coursesInSelectedSubject.length > 0

      onNameChange(nextValue)

      // 入力が空でも、フォーカス中ならサジェストを表示
      setIsSuggestionVisible(hasSuggestions)
    },
    [coursesInSelectedSubject, onNameChange]
  )

  const handleCourseNameFocus = useCallback(() => {
    clearBlurTimeout()
    if (!subjectId) return
    // 入力が空でも、科目に属する講座があればサジェストを表示
    if (coursesInSelectedSubject.length > 0) {
      setIsSuggestionVisible(true)
    }
  }, [coursesInSelectedSubject.length, subjectId])

  const handleCourseNameBlur = useCallback(() => {
    clearBlurTimeout()
    // 自動選択はしない。ユーザーがサジェストをクリックすることを強制する
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsSuggestionVisible(false)
      blurTimeoutRef.current = null
    }, 120)
  }, [])

  return (
    <CourseNameField
      value={value}
      onChange={handleCourseNameChange}
      onFocus={handleCourseNameFocus}
      onBlur={handleCourseNameBlur}
      isSuggestionVisible={isSuggestionVisible}
      suggestions={suggestedCourses}
      onSelectSuggestion={applyExistingCourseSelection}
    />
  )
}
