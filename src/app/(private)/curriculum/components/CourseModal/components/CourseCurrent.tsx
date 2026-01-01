'use client'

import { useEffect, useRef, useCallback, startTransition } from 'react'
import styles from '../CourseModal.module.css'
import type { CourseModalOptions, CourseFormValues } from '../types'
import { useCourseCurrent } from '../hooks/useCourseCurrent'
import { SubjectSelectField } from './SubjectSelectField'
import { InstructorSelectField } from './InstructorSelectField'
import { useForm, useFieldArray } from 'react-hook-form'
import { useInstructorFields } from '../hooks/useInstructorFields'

interface CourseCurrentProps {
  isOpen: boolean
  laneId: string
  courseId: string
  courseModalOptions: CourseModalOptions
  initialValues: CourseFormValues
  onClose: () => void
  onSuccess: () => void
}

/**
 * 講座編集コンポーネント
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
  // カスタムフック
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
  const courseNameValue = watch('courseName')
  const courseDetailsValue = watch('courseDetails') || []

  // ペンディング状態
  const isPending = updatePending || removePending

  // 科目、教員のオプションリスト
  const subjectOptions = courseModalOptions.subjects || []
  const instructorOptions = courseModalOptions.instructors || []

  // 科目は編集不可として初期値で固定する
  const subjectIdValue = initialValues.subjectId
  const currentSubject = subjectOptions.find(s => s.id === subjectIdValue)

  // 教員フィールドコンポーネントのカスタムフック
  const { addInstructorField, removeInstructorField, updateInstructorField } =
    useInstructorFields({
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
    reset(initialValues)
    replace(initialValues.courseDetails)
    clearError()
  }, [reset, replace, initialValues, clearError])

  // モーダルを閉じるときの処理
  const handleClose = useCallback(() => {
    resetFormState()
    onClose()
  }, [resetFormState, onClose])

  // 保存処理
  const handleSave = useCallback(() => {
    if (!isFormValid) return

    const formData = new FormData()
    formData.append('courseId', courseId)
    formData.append('subjectId', subjectIdValue || '')
    formData.append('courseName', courseNameValue)
    courseDetailsValue.forEach(detail => {
      if (detail.instructorId) {
        formData.append('instructorIds', detail.instructorId)
      }
    })

    startTransition(() => {
      updateAction(formData)
    })
  }, [
    isFormValid,
    courseId,
    subjectIdValue,
    courseNameValue,
    courseDetailsValue,
    updateAction,
  ])

  // 削除処理
  const handleDelete = useCallback(() => {
    if (!confirm('本当にこの講座をレーンから削除しますか？')) {
      return
    }

    const formData = new FormData()
    formData.append('laneId', laneId)
    formData.append('courseId', courseId)

    startTransition(() => {
      removeAction(formData)
    })
  }, [laneId, courseId, removeAction])

  // モーダルが開いたときに初期値をリセット
  useEffect(() => {
    if (isOpen) {
      reset(initialValues)
      replace(initialValues.courseDetails)
      clearError()
    }
  }, [isOpen, reset, replace, initialValues, clearError])

  // 前回の保存結果を保持
  const prevUpdateResultRef = useRef<typeof updateResult>(null)
  // 保存結果が変わったときの処理
  useEffect(() => {
    if (updateResult?.success && updateResult !== prevUpdateResultRef.current) {
      resetFormState()
      clearError()
      onSuccess()
    }
    prevUpdateResultRef.current = updateResult
  }, [updateResult, resetFormState, clearError, onSuccess])

  // 前回の削除結果を保持
  const prevRemoveResultRef = useRef<typeof removeResult>(null)
  // 削除結果が変わったときの処理
  useEffect(() => {
    if (removeResult?.success && removeResult !== prevRemoveResultRef.current) {
      resetFormState()
      clearError()
      onSuccess()
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

      <div className={styles.form}>
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
                  subjects={subjectOptions}
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

      {/* 削除ボタン */}
      <div className={styles.deleteForm}>
        <button
          type="button"
          onClick={handleDelete}
          className={styles.deleteButton}
          disabled={isPending}
        >
          レーンから削除
        </button>
      </div>
    </>
  )
}
