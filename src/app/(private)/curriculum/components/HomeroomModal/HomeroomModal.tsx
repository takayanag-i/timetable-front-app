'use client'
import { useEffect, useRef, startTransition } from 'react'
import Modal from '@/components/shared/Modal'
import Input from '@/components/shared/Input'
import type { Grade } from '@/app/(private)/curriculum/types'
import type { HomeroomFormValues } from './types'
import { useHomeroomModal } from './hooks/useHomeroomModal'
import styles from './HomeroomModal.module.css'
import { useForm, useFieldArray } from 'react-hook-form'
import { DAY_OF_WEEK_MAP } from '@/constants'


interface HomeroomModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  title: string
  initialValues: HomeroomFormValues
  grades: Grade[]
  onSuccess: () => void
  onClose: () => void
}

/**
 * 学級モーダル
 */
export default function HomeroomModal({
  isOpen,
  mode,
  title,
  initialValues,
  grades,
  onSuccess,
  onClose,
}: HomeroomModalProps) {
  // カスタムフック
  const {
    error,
    clearError,
    saveAction,
    savePending,
    saveResult,
    deleteAction,
    deletePending,
    deleteResult,
  } = useHomeroomModal({
    mode,
    homeroomId: initialValues.id,
  })

  // RHFのフック
  const {
    control,
    register,
    reset,
    watch,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<HomeroomFormValues>({
    defaultValues: initialValues,
    mode: 'onChange',
  })

  const homeroomNameRegister = register('homeroomName', {
    // 必須チェック
    validate: value =>
      value.trim().length > 0 || '学級名を入力してください',
  })
  const gradeIdRegister = register('gradeId', {
    // 必須チェック
    validate: value =>
      value.trim().length > 0 || '学年を選択してください',
  })

  // 配列項目のフック
  const { fields, replace } = useFieldArray({
    control,
    name: 'homeroomDays',
  })

  // モーダルが開いたときに初期値をリセット
  useEffect(() => {
    if (isOpen) {
      reset(initialValues)
      replace(initialValues.homeroomDays)
      clearError()
    }
  }, [isOpen, reset, replace, initialValues, clearError])

  // 前回の保存結果を保持
  const prevSaveResultRef = useRef<typeof saveResult>(null)

  // 保存成功時の処理
  useEffect(() => {
    if (saveResult?.success && saveResult !== prevSaveResultRef.current) {
      // コールバックを呼び出し
      onSuccess()

      // リセット
      const resetValues: HomeroomFormValues = {
        ...initialValues,
        homeroomName: initialValues.id ? initialValues.homeroomName : '',
        gradeId: initialValues.id ? initialValues.gradeId : '',
      }
      reset(resetValues)

      // エラークリア
      clearError()
    }
    prevSaveResultRef.current = saveResult
  }, [saveResult, initialValues, onSuccess, reset, clearError])

  // 前回の削除結果を保持
  const prevDeleteResultRef = useRef<typeof deleteResult>(null)

  // 削除成功時の処理
  useEffect(() => {
    if (deleteResult?.success && deleteResult !== prevDeleteResultRef.current) {
      // コールバックを呼び出し
      onSuccess()

      // リセット
      reset(initialValues)

      // エラークリア
      clearError()
    }
    prevDeleteResultRef.current = deleteResult
  }, [clearError, initialValues, deleteResult, onSuccess, reset])

  // モーダルを閉じるときの処理
  const handleClose = () => {
    reset(initialValues)
    clearError()
    onClose()
  }

  // フォームの値を監視
  const homeroomNameValue = watch('homeroomName') ?? ''
  const gradeIdValue = watch('gradeId') ?? ''

  useEffect(() => {
    if (grades.length === 1 && !gradeIdValue) {
      setValue('gradeId', grades[0].id)
    }
  }, [grades, gradeIdValue, setValue])

  // 保存ボタンの無効化条件
  const isSaveDisabled =
    savePending ||
    !!errors.homeroomName ||
    !!errors.gradeId

  // 保存処理
  const handleSave = async () => {
    const isValid = await trigger()
    if (!isValid) return

    // FormDataを作成
    const values = getValues()
    const formData = new FormData()
    formData.append('homeroomId', values.id)
    formData.append('homeroomName', homeroomNameValue.trim())
    formData.append('gradeId', gradeIdValue)
    values.homeroomDays.forEach(day => {
      formData.append('dayOfWeeks', day.dayOfWeek)
      formData.append('periods', day.periods.toString())
      formData.append('homeroomDayIds', day.id || '')
    })

    // Server Actionを実行
    startTransition(() => {
      saveAction(formData)
    })
  }

  // 削除処理
  const handleDelete = () => {
    if (
      !window.confirm(
        'この学級を削除すると、学級内のブロックや講座も削除されます。本当に削除しますか？'
      )
    ) {
      return
    }

    // FormDataを作成
    const values = getValues()
    const formData = new FormData()
    formData.append('homeroomId', values.id)
    formData.append('gradeId', gradeIdValue)

    // Server Actionを実行
    startTransition(() => {
      deleteAction(formData)
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {/* タイトル表示 */}
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className={styles.errorMessage} role="alert">
          エラー: {error}
        </div>
      )}

      {/* 学級名入力 */}
      <Input
        id="homeroomName"
        label="学級名"
        placeholder="学級名を入力"
        {...homeroomNameRegister}
        aria-invalid={errors.homeroomName ? 'true' : 'false'}
      />
      {errors.homeroomName && (
        <p className={styles.fieldError}>{errors.homeroomName.message}</p>
      )}

      <div className={styles.selectWrapper}>
        <label htmlFor="gradeId" className={styles.label}>
          学年
        </label>
        <select
          id="gradeId"
          className={styles.select}
          disabled={grades.length === 0}
          {...gradeIdRegister}
          aria-invalid={errors.gradeId ? 'true' : 'false'}
        >
          <option value="">学年を選択</option>
          {grades.map(grade => (
            <option key={grade.id} value={grade.id}>
              {grade.gradeName}
            </option>
          ))}
        </select>
      </div>
      {errors.gradeId && (
        <p className={styles.fieldError}>{errors.gradeId.message}</p>
      )}

      {/* 学級曜日テーブル */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>曜日</th>
            <th>コマ数</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={field.id ?? field.dayOfWeek}>
              <td style={{ textAlign: 'center', padding: '8px' }}>
                {DAY_OF_WEEK_MAP[field.dayOfWeek] || field.dayOfWeek}
              </td>
              <td style={{ textAlign: 'center', padding: '8px' }}>
                <input
                  type="number"
                  min={0}
                  className={styles.input}
                  style={{ width: '60px' }}
                  {...register(`homeroomDays.${index}.periods`, {
                    valueAsNumber: true,
                    min: { value: 0, message: '0以上で入力してください' },
                    setValueAs: value => {
                      const parsed = parseInt(value, 10)
                      if (Number.isNaN(parsed)) {
                        return 0
                      }
                      return Math.max(0, parsed)
                    },
                  })}
                />
                {errors.homeroomDays?.[index]?.periods && (
                  <p className={styles.fieldError}>
                    {errors.homeroomDays[index]?.periods?.message}
                  </p>
                )}
                <input
                  type="hidden"
                  {...register(`homeroomDays.${index}.dayOfWeek`)}
                  value={field.dayOfWeek}
                  readOnly
                />
                <input
                  type="hidden"
                  {...register(`homeroomDays.${index}.id`)}
                  value={field.id ?? ''}
                  readOnly
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.buttonGroup}>
        {/* 保存ボタン */}
        <button
          type="button"
          onClick={handleSave}
          className={styles.saveButton}
          disabled={isSaveDisabled}
        >
          {savePending ? '保存中...' : '保存'}
        </button>

        {/* 削除ボタン（編集時のみ表示） */}
        {initialValues.id && (
          <button
            type="button"
            onClick={handleDelete}
            className={styles.deleteButton}
            disabled={deletePending}
          >
            {deletePending ? '削除中...' : '削除'}
          </button>
        )}

        <button
          type="button"
          onClick={handleClose}
          className={styles.cancelButton}
        >
          閉じる
        </button>
      </div>
    </Modal>
  )
}
