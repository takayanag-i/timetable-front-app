'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import styles from '../CourseModal.module.css'
import type { CourseModalOptions, CourseFormValues } from '@/types/ui-types'
import { useCourseAddOrChange } from '../hooks/useCourseAddOrChange'
import { useCourseSuggestions } from '../hooks/useCourseSuggestions'
import { useFilteredInstructors } from '../hooks/useFilteredInstructors'
import { SubjectSelectField } from './SubjectSelectField'
import { CourseNameFieldContainer } from './CourseNameFieldContainer'
import { InstructorSelectField } from './InstructorSelectField'
import { useForm, useFieldArray } from 'react-hook-form'
import { useInstructorFields } from '../hooks/useInstructorFields'

/**
 * CourseAddOrChange コンポーネントのProps
 */
interface CourseAddOrChangeProps {
  /** モーダルの表示状態 */
  isOpen: boolean
  /** モーダルを閉じる際のコールバック */
  onClose: () => void
  /** 成功時コールバック */
  onSuccess?: () => void
  /** 科目/教員/既存講座オプション */
  courseModalOptions: CourseModalOptions | null
  /** レーンID */
  laneId?: string
  /** ブロックID */
  blockId?: string
  /** フォームの初期値 */
  initialValues: CourseFormValues
  /** 絞り込み対象の学年ID */
  gradeId?: string
}

/**
 * 講座追加・変更コンポーネント（新規作成・講座変更用）
 * - 科目は選択可
 * - 講座名はサジェストあり（フォーカス時に全講座表示、入力で絞り込み）
 */
export function CourseAddOrChange({
  isOpen,
  onClose,
  onSuccess,
  courseModalOptions,
  laneId,
  blockId,
  initialValues,
  gradeId,
}: CourseAddOrChangeProps) {
  const [selectedCourseId, setSelectedCourseId] = useState('')

  const {
    error,
    clearError,
    setError: setErrorManually,
    createAction,
    createPending,
    createResult,
  } = useCourseAddOrChange({
    laneId,
    blockId,
  })

  const { control, watch, setValue, reset } = useForm<CourseFormValues>({
    defaultValues: initialValues,
    mode: 'onChange',
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'courseDetails',
  })

  const subjectIdValue = watch('subjectId')
  const courseNameValue = watch('courseName')
  const courseDetailsValue = watch('courseDetails') || []

  const isPending = createPending

  const subjectOptions = courseModalOptions?.subjects || []
  const instructorOptions = courseModalOptions?.instructors || []
  const courseOptions = courseModalOptions?.courses || []

  const filteredSubjects = useMemo(() => {
    if (!gradeId) {
      return subjectOptions
    }
    const subjectForGrade = subjectOptions.filter(
      subject => subject.grade?.id === gradeId
    )
    return subjectForGrade
  }, [subjectOptions, gradeId])

  const { coursesInSelectedSubject, suggestedCourses, selectedCourse } =
    useCourseSuggestions({
      subjectId: subjectIdValue,
      courses: courseOptions,
      selectedCourseId,
      courseName: courseNameValue,
    })

  const { availableInstructors } = useFilteredInstructors({
    subjectId: subjectIdValue,
    subjects: filteredSubjects,
    instructors: instructorOptions,
  })

  const {
    addInstructorField,
    removeInstructorField,
    updateInstructorField,
    resetInstructorFields,
  } = useInstructorFields({
    courseDetailsValue,
    append,
    remove,
    replace,
    setValue,
  })

  const hasInstructor =
    courseDetailsValue.length > 0 &&
    courseDetailsValue.every(detail => !!detail.instructorId)
  const isFormValid = !!subjectIdValue && !!courseNameValue && hasInstructor

  const courseNameToSubmit = courseNameValue

  const instructorIdsToSubmit = courseDetailsValue.map(
    detail => detail.instructorId
  )

  const resetFormState = useCallback(() => {
    reset({
      subjectId: '',
      courseName: '',
      courseDetails: [{ instructorId: '' }],
    })
    replace([{ instructorId: '' }])
    clearError()
    setSelectedCourseId('')
  }, [reset, replace, clearError])

  const handleCourseNameChange = useCallback(
    (nextValue: string) => {
      const trimmedValue = nextValue.trim()
      const normalizedValue = trimmedValue.toLowerCase()

      // 入力内容が完全一致する講座があるかチェック
      const matchedCourse = coursesInSelectedSubject.find(
        course => course.courseName.toLowerCase() === normalizedValue
      )

      // 完全一致する講座がある場合でも、ユーザーがサジェストをクリックするまで
      // 選択を維持しない（selectedCourseIdをリセットしない）
      // ただし、現在選択されている講座と完全一致する場合はリセットしない
      if (!matchedCourse || matchedCourse.id !== selectedCourseId) {
        setSelectedCourseId('')
        resetInstructorFields()
      }

      setValue('courseName', nextValue)
    },
    [
      coursesInSelectedSubject,
      selectedCourseId,
      resetInstructorFields,
      setValue,
    ]
  )

  const handleSelectExistingCourse = useCallback(
    (course: { id: string; courseName: string; instructorIds: string[] }) => {
      setSelectedCourseId(course.id)
      setValue('courseName', course.courseName)
      replace(
        course.instructorIds.length > 0
          ? course.instructorIds.map(id => ({ instructorId: id }))
          : [{ instructorId: '' }]
      )
    },
    [replace, setValue]
  )

  const handleSubjectChange = useCallback(
    (subjectId: string) => {
      setValue('subjectId', subjectId)
      setValue('courseName', '')
      resetInstructorFields()
      setSelectedCourseId('')
    },
    [resetInstructorFields, setValue]
  )

  const handleClose = useCallback(() => {
    resetFormState()
    onClose()
  }, [resetFormState, onClose])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const trimmedCourseName = courseNameValue.trim()
    if (!trimmedCourseName) return

    const exactMatchCourse = coursesInSelectedSubject.find(
      course =>
        course.courseName.toLowerCase() === trimmedCourseName.toLowerCase()
    )

    if (exactMatchCourse && !selectedCourseId) {
      e.preventDefault()
      setErrorManually(
        `同名の講座「${trimmedCourseName}」が既に存在します。サジェストから選択してください。`
      )
    }
  }

  // モーダルが開いたときに初期値をリセット
  useEffect(() => {
    if (isOpen) {
      reset(initialValues)
      replace(initialValues.courseDetails)
      clearError()
    }
  }, [isOpen, reset, replace, initialValues, clearError])

  // 成功時の処理
  const prevCreateResultRef = useRef<typeof createResult>(null)
  useEffect(() => {
    if (createResult?.success && createResult !== prevCreateResultRef.current) {
      resetFormState()
      clearError()
      onSuccess?.()
    }
    prevCreateResultRef.current = createResult
  }, [createResult, resetFormState, clearError, onSuccess])

  return (
    <>
      {error && (
        <div className={styles.errorMessage} role="alert">
          エラー: {error}
        </div>
      )}

      <form
        action={createAction}
        onSubmit={handleSubmit}
        className={styles.form}
      >
        <input type="hidden" name="subjectId" value={subjectIdValue} />
        <input type="hidden" name="courseName" value={courseNameToSubmit} />
        {instructorIdsToSubmit.length > 0 ? (
          instructorIdsToSubmit.map((instructorId, index) => (
            <input
              key={`${instructorId}-${index}`}
              type="hidden"
              name="instructorIds"
              value={instructorId}
            />
          ))
        ) : (
          <input type="hidden" name="instructorIds" value="" />
        )}
        <input type="hidden" name="selectedCourseId" value={selectedCourseId} />
        <input type="hidden" name="laneId" value={laneId || ''} />
        <input type="hidden" name="blockId" value={blockId || ''} />

        <SubjectSelectField
          subjects={filteredSubjects}
          value={subjectIdValue}
          onChange={handleSubjectChange}
        />

        <CourseNameFieldContainer
          value={courseNameValue}
          subjectId={subjectIdValue || ''}
          editMode={false}
          coursesInSelectedSubject={coursesInSelectedSubject}
          suggestedCourses={suggestedCourses}
          onNameChange={handleCourseNameChange}
          onSelectExistingCourse={handleSelectExistingCourse}
        />

        <div className={styles.instructorList}>
          {fields.map((field, index) => {
            const selectedOtherInstructorIds = courseDetailsValue
              .filter((_, detailIndex) => detailIndex !== index)
              .map(item => item.instructorId)
              .filter((id): id is string => Boolean(id))

            const filteredInstructors = availableInstructors.filter(
              instructor =>
                instructor.id === courseDetailsValue[index]?.instructorId ||
                !selectedOtherInstructorIds.includes(instructor.id)
            )

            return (
              <div
                key={`instructor-field-${index}`}
                className={styles.instructorRow}
              >
                <InstructorSelectField
                  selectId={`instructor-${index}`}
                  label={`担当教員 ${index + 1} *`}
                  value={courseDetailsValue[index]?.instructorId || ''}
                  onChange={instructorId =>
                    updateInstructorField(index, instructorId)
                  }
                  instructors={filteredInstructors}
                  disabled={availableInstructors.length === 0}
                  showNoInstructorsHelper={
                    Boolean(subjectIdValue) && availableInstructors.length === 0
                  }
                />
                {courseDetailsValue.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeInstructorButton}
                    onClick={() => removeInstructorField(index)}
                  >
                    削除
                  </button>
                )}
              </div>
            )
          })}
          <button
            type="button"
            className={styles.addInstructorButton}
            onClick={addInstructorField}
            aria-label="担当教員を追加"
          >
            <span aria-hidden="true" className={styles.addInstructorIcon}>
              ＋
            </span>
          </button>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleClose}
            disabled={isPending}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isPending || !isFormValid}
          >
            {isPending ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </>
  )
}
