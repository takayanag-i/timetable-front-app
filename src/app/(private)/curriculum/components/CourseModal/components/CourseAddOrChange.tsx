'use client'

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  startTransition,
} from 'react'
import styles from '../CourseModal.module.css'
import type {
  CourseModalOptions,
  CourseFormValues,
  CourseModalCourse,
} from '../types'
import { useCourseAddOrChange } from '../hooks/useCourseAddOrChange'
import { useCourseSuggestions } from '../hooks/useCourseSuggestions'
import { SubjectSelectField } from './SubjectSelectField'
import { CourseNameField } from './CourseNameField'
import { InstructorSelectField } from './InstructorSelectField'
import { useForm, useFieldArray } from 'react-hook-form'
import { useInstructorFields } from '../hooks/useInstructorFields'

interface CourseAddOrChangeProps {
  isOpen: boolean
  laneId: string
  gradeId?: string
  initialValues: CourseFormValues
  courseModalOptions: CourseModalOptions
  onClose: () => void
  onSuccess: () => void
}

/**
 * 講座追加・講座変更コンポーネント
 */
export function CourseAddOrChange({
  isOpen,
  onClose,
  onSuccess,
  courseModalOptions,
  laneId,
  initialValues,
  gradeId,
}: CourseAddOrChangeProps) {
  // カスタムフック
  const {
    error,
    clearError,
    setError,
    createAction,
    createPending,
    createResult,
  } = useCourseAddOrChange({
    laneId,
  })

  // RHFのフック
  const { control, watch, setValue, reset } = useForm<CourseFormValues>({
    defaultValues: initialValues,
    mode: 'onChange',
  })

  // 配列の項目に対するフック
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'courseDetails',
  })

  // フォームの値を監視
  const courseIdValue = watch('courseId')
  const subjectIdValue = watch('subjectId')
  const courseNameValue = watch('courseName')
  const courseDetailsValue = watch('courseDetails') || []

  // ペンディング状態
  const isPending = createPending

  // 科目、教員、講座のオプションリスト
  const subjectOptions = courseModalOptions.subjects || []
  const instructorOptions = courseModalOptions.instructors || []
  const courseOptions = courseModalOptions.courses || []

  // 学年に応じた科目リストを取得
  const filteredSubjectOptions = useMemo(() => {
    if (!gradeId) {
      return subjectOptions
    }
    const subjectForGrade = subjectOptions.filter(
      subject => subject.grade?.id === gradeId
    )
    return subjectForGrade
  }, [subjectOptions, gradeId])

  // 講座サジェストコンポーネントのカスタムフック
  const { coursesInSelectedSubject, suggestedCourses, exactMatchCourse } =
    useCourseSuggestions({
      courses: courseOptions,
      subjectId: subjectIdValue,
      courseName: courseNameValue,
    })

  // 教員フィールドコンポーネントのカスタムフック
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

  // 教員IDの存在チェック
  const hasInstructor =
    courseDetailsValue.length > 0 &&
    courseDetailsValue.every(detail => !!detail.instructorId)

  // 科目ID、講座名、教員IDが存在する場合、フォームが有効
  const isFormValid = !!subjectIdValue && !!courseNameValue && hasInstructor

  // フォームをリセットする
  const resetFormState = useCallback(() => {
    reset({
      courseId: '',
      subjectId: '',
      courseName: '',
      courseDetails: [{ instructorId: '' }],
    })
    replace([{ instructorId: '' }])
    clearError()
  }, [reset, replace, clearError])

  // 講座名が変わったときの処理
  const handleCourseNameChange = useCallback(
    (nextValue: string) => {
      setValue('courseId', '')
      setValue('courseName', nextValue)
      resetInstructorFields()
    },
    [resetInstructorFields, setValue]
  )

  // 講座を選択したときの処理
  const handleSelectExistingCourse = useCallback(
    (course: CourseModalCourse) => {
      setValue('courseId', course.id)
      setValue('courseName', course.courseName)
      replace(
        course.instructorIds.length > 0
          ? course.instructorIds.map(id => ({ instructorId: id }))
          : [{ instructorId: '' }]
      )
    },
    [replace, setValue]
  )

  // 科目が変わったときの処理
  const handleSubjectChange = useCallback(
    (subjectId: string) => {
      setValue('courseId', '')
      setValue('subjectId', subjectId)
      setValue('courseName', '')
      resetInstructorFields()
    },
    [resetInstructorFields, setValue]
  )

  // モーダルを閉じるときの処理
  const handleClose = useCallback(() => {
    resetFormState()
    onClose()
  }, [resetFormState, onClose])

  // 保存処理
  const handleSave = useCallback(() => {
    const trimmedCourseName = courseNameValue.trim()
    if (!trimmedCourseName) return

    if (exactMatchCourse && !courseIdValue) {
      // 同一名称の講座は新規登録できない
      setError(
        `同名の講座「${trimmedCourseName}」は既に存在します。サジェストから選択してください。`
      )
      return
    }

    if (!isFormValid) return

    const formData = new FormData()
    formData.append('courseId', courseIdValue)
    formData.append('subjectId', subjectIdValue)
    formData.append('courseName', courseNameValue)
    courseDetailsValue.forEach(detail => {
      if (detail.instructorId) {
        formData.append('instructorIds', detail.instructorId)
      }
    })
    formData.append('laneId', laneId)

    startTransition(() => {
      createAction(formData)
    })
  }, [
    courseNameValue,
    exactMatchCourse,
    courseIdValue,
    isFormValid,
    subjectIdValue,
    courseDetailsValue,
    laneId,
    createAction,
    setError,
  ])

  // モーダルが開いたときに初期値をリセット
  useEffect(() => {
    if (isOpen) {
      reset(initialValues)
      replace(initialValues.courseDetails)
      clearError()
    }
  }, [isOpen, reset, replace, initialValues, clearError])

  // 前回の保存結果を保持
  const prevCreateResultRef = useRef<typeof createResult>(null)
  // 保存結果が変わったときの処理
  useEffect(() => {
    if (createResult?.success && createResult !== prevCreateResultRef.current) {
      resetFormState()
      clearError()
      onSuccess()
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

      <div className={styles.form}>
        <SubjectSelectField
          subjects={filteredSubjectOptions}
          value={subjectIdValue}
          onChange={handleSubjectChange}
        />

        <CourseNameField
          value={courseNameValue}
          subjectId={subjectIdValue || ''}
          coursesInSelectedSubject={coursesInSelectedSubject}
          suggestedCourses={suggestedCourses}
          exactMatchCourse={exactMatchCourse}
          onNameChange={handleCourseNameChange}
          onSelectExistingCourse={handleSelectExistingCourse}
        />

        <div className={styles.instructorList}>
          {fields.map((field, index) => {
            const selectedOtherInstructorIds = courseDetailsValue
              .filter((_, detailIndex) => detailIndex !== index)
              .map(item => item.instructorId)
              .filter((id): id is string => Boolean(id))

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
                  subjectId={subjectIdValue}
                  subjects={filteredSubjectOptions}
                  instructors={instructorOptions}
                  selectedInstructorIds={selectedOtherInstructorIds}
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
            type="button"
            onClick={handleSave}
            className={styles.primaryButton}
            disabled={isPending || !isFormValid}
          >
            {isPending ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </>
  )
}
