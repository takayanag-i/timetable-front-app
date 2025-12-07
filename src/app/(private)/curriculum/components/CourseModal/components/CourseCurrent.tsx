'use client'

import { useEffect, useRef, useCallback } from 'react'
import styles from '../CourseModal.module.css'
import type { CourseModalOptions, CourseFormValues } from '@/types/ui-types'
import { useCourseCurrent } from '../hooks/useCourseCurrent'
import { useFilteredInstructors } from '../hooks/useFilteredInstructors'
import { SubjectSelectField } from './SubjectSelectField'
import { InstructorSelectField } from './InstructorSelectField'
import { useForm, useFieldArray } from 'react-hook-form'
import { useInstructorFields } from '../hooks/useInstructorFields'

interface CourseCurrentProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  courseModalOptions: CourseModalOptions | null
  laneId: string
  courseId: string
  initialValues: CourseFormValues
}

/**
 * 講座編集コンポーネント（現在の講座を編集）
 * - 科目は変更不可（disabled）
 * - 講座名はサジェストなし（通常のinput）
 */
export function CourseCurrent({
  isOpen,
  onClose,
  onSuccess,
  courseModalOptions,
  laneId,
  courseId,
  initialValues,
}: CourseCurrentProps) {
  const {
    error,
    clearError,
    updateAction,
    updatePending,
    updateResult,
    removeAction,
    removePending,
    removeResult,
  } = useCourseCurrent({
    laneId,
    courseId,
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

  const isPending = updatePending || removePending

  const subjectOptions = courseModalOptions?.subjects || []
  const instructorOptions = courseModalOptions?.instructors || []

  // 科目は初期値で固定
  const currentSubject = subjectOptions.find(s => s.id === subjectIdValue)

  const { availableInstructors } = useFilteredInstructors({
    subjectId: subjectIdValue,
    subjects: subjectOptions,
    instructors: instructorOptions,
  })

  const { addInstructorField, removeInstructorField, updateInstructorField } =
    useInstructorFields({
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

  const instructorIdsToSubmit = courseDetailsValue.map(
    detail => detail.instructorId
  )

  const resetFormState = useCallback(() => {
    reset(initialValues)
    replace(initialValues.courseDetails)
    clearError()
  }, [reset, replace, initialValues, clearError])

  const handleClose = useCallback(() => {
    resetFormState()
    onClose()
  }, [resetFormState, onClose])

  // モーダルが開いたときに初期値をリセット
  useEffect(() => {
    if (isOpen) {
      reset(initialValues)
      replace(initialValues.courseDetails)
      clearError()
    }
  }, [isOpen, reset, replace, initialValues, clearError])

  // 成功時の処理
  const prevUpdateResultRef = useRef<typeof updateResult>(null)
  useEffect(() => {
    if (updateResult?.success && updateResult !== prevUpdateResultRef.current) {
      resetFormState()
      clearError()
      onSuccess?.()
    }
    prevUpdateResultRef.current = updateResult
  }, [updateResult, resetFormState, clearError, onSuccess])

  const prevRemoveResultRef = useRef<typeof removeResult>(null)
  useEffect(() => {
    if (removeResult?.success && removeResult !== prevRemoveResultRef.current) {
      resetFormState()
      clearError()
      onSuccess?.()
    }
    prevRemoveResultRef.current = removeResult
  }, [removeResult, resetFormState, clearError, onSuccess])

  return (
    <>
      {error && (
        <div className={styles.errorMessage} role="alert">
          エラー: {error}
        </div>
      )}

      <form action={updateAction} className={styles.form}>
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="subjectId" value={subjectIdValue} />
        <input type="hidden" name="courseName" value={courseNameValue} />
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

        {/* 科目フィールド（変更不可） */}
        <div className={styles.field}>
          <label className={styles.label}>科目 *</label>
          <input
            type="text"
            value={currentSubject?.subjectName || ''}
            disabled
            className={styles.select}
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          />
        </div>

        {/* 講座名フィールド（サジェストなし） */}
        <div className={styles.field}>
          <label htmlFor="courseName" className={styles.label}>
            講座名 *
          </label>
          <input
            id="courseName"
            type="text"
            value={courseNameValue}
            onChange={e => setValue('courseName', e.target.value)}
            className={styles.select}
            placeholder="講座名を入力"
          />
        </div>

        {/* 担当教員フィールド */}
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

      {/* 削除用の独立したフォーム */}
      <form
        action={removeAction}
        onSubmit={e => {
          if (!confirm('本当にこの講座をレーンから削除しますか？')) {
            e.preventDefault()
          }
        }}
        className={styles.deleteForm}
      >
        <input type="hidden" name="laneId" value={laneId} />
        <input type="hidden" name="courseId" value={courseId} />
        <button
          type="submit"
          className={styles.deleteButton}
          disabled={isPending}
        >
          レーンから削除
        </button>
      </form>
    </>
  )
}
