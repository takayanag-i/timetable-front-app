'use client'

import { useCallback, useEffect, useState } from 'react'
import Input from '@/components/shared/Input'
import type { CourseModalCourse, CourseModalOptions } from '../types'
import styles from '../CourseModal.module.css'

interface CourseNameFieldProps {
  value: string
  subjectId: string
  coursesInSelectedSubject: CourseModalCourse[]
  suggestedCourses: CourseModalCourse[]
  exactMatchCourse: CourseModalCourse | null
  onNameChange: (value: string) => void
  onSelectExistingCourse: (course: CourseModalCourse) => void
}

export function CourseNameField({
  value,
  subjectId,
  coursesInSelectedSubject,
  suggestedCourses,
  exactMatchCourse,
  onNameChange,
  onSelectExistingCourse,
}: CourseNameFieldProps) {
  // サジェスト表示状態
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false)

  // 該当0件の場合はサジェストを表示しない
  useEffect(() => {
    if (suggestedCourses.length === 0) {
      setIsSuggestionVisible(false)
    }
  }, [suggestedCourses.length])

  // 科目が選択されていない場合はサジェストを表示しない
  useEffect(() => {
    if (!subjectId) {
      setIsSuggestionVisible(false)
    }
  }, [subjectId])

  // 講座を選択したときの処理
  const applyExistingCourseSelection = useCallback(
    (course: CourseModalCourse) => {
      // コールバックを呼び出す
      onSelectExistingCourse(course)
      // サジェストを非表示
      setIsSuggestionVisible(false)
    },
    [onSelectExistingCourse]
  )

  // 講座名が変わったときの処理
  const handleCourseNameChange = useCallback(
    (nextValue: string) => {
      // コールバックを呼び出す
      onNameChange(nextValue)

      const trimmedValue = nextValue.trim()

      if (exactMatchCourse) {
        // 完全一致がある場合は、その1件をサジェストとして表示
        setIsSuggestionVisible(true)
        return
      }

      // サジェストするものがあるか判定
      const hasSuggestions =
        trimmedValue.length > 0
          ? suggestedCourses.length > 0
          : coursesInSelectedSubject.length > 0

      // 判定結果を反映
      setIsSuggestionVisible(hasSuggestions)
    },
    [coursesInSelectedSubject, suggestedCourses, exactMatchCourse, onNameChange]
  )

  // フォーカス時の処理
  const handleCourseNameFocus = useCallback(() => {
    if (!subjectId) return
    // 入力が空でも、科目に属する講座があればサジェストを表示
    if (coursesInSelectedSubject.length > 0) {
      setIsSuggestionVisible(true)
    }
  }, [coursesInSelectedSubject.length, subjectId])

  // フォーカスが外れたときの処理
  const handleCourseNameBlur = useCallback(() => {
    setIsSuggestionVisible(false)
  }, [])

  return (
    <div className={styles.field}>
      <div className={styles.courseNameWrapper}>
        <Input
          id="courseName"
          label="講座名 *"
          value={value}
          onValueChange={handleCourseNameChange}
          placeholder="例: 数学Ⅰ基礎"
          onFocus={handleCourseNameFocus}
          onBlur={handleCourseNameBlur}
          autoComplete="off"
        />
        {isSuggestionVisible && suggestedCourses.length > 0 && (
          <div className={styles.suggestionList}>
            {suggestedCourses.map(course => (
              <button
                key={course.id}
                type="button"
                className={styles.suggestionItem}
                onMouseDown={event => {
                  event.preventDefault()
                  applyExistingCourseSelection(course)
                }}
              >
                <span className={styles.suggestionName}>
                  {course.courseName}
                </span>
                {course.instructorNames.length > 0 && (
                  <span className={styles.suggestionMeta}>
                    {course.instructorNames.join(', ')}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
