'use client'
import { useEffect, useRef } from 'react'
import Modal from '@/components/shared/Modal'
import Input from '@/components/shared/Input'
import type { Grade } from '@/core/domain/entity'
import type { HomeroomFormValues } from './hooks/useHomeroomModal'
import { useHomeroomModal } from './hooks/useHomeroomModal'
import styles from './HomeroomModal.module.css'
import { useForm, useFieldArray } from 'react-hook-form'

// 曜日の変換マップ
const dayOfWeekMap: Record<string, string> = {
  mon: '月',
  tue: '火',
  wed: '水',
  thu: '木',
  fri: '金',
  sat: '土',
  sun: '日',
}

/**
 * HomeroomModal コンポーネントのProps
 */
interface Props {
  /** モーダルの表示状態 */
  isOpen: boolean
  /** モーダルのタイトル */
  title: string
  /** フォームの初期値 */
  initialValues: HomeroomFormValues
  /** 学年の選択肢 */
  grades: Grade[]
  /** 処理成功時のコールバック */
  onSuccess: () => void
  /** モーダルを閉じる際に呼び出されるコールバック */
  onClose: () => void
}

/**
 * 学級モーダル
 *
 * @param props.isOpen - モーダルの表示状態
 * @param props.title - モーダルのタイトル
 * @param props.initialValues - フォームの初期値
 * @param props.onSuccess - 処理成功時のコールバック
 * @param props.onClose - モーダルを閉じる際のコールバック
 */
export default function HomeroomModal({
  isOpen,
  title,
  initialValues,
  grades,
  onSuccess,
  onClose,
}: Props) {
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
    initialValues,
  })

  const {
    control,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HomeroomFormValues>({
    defaultValues: initialValues,
    mode: 'onChange',
  })

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

  // 成功時の処理
  const prevSaveResultRef = useRef<typeof saveResult>(null)
  useEffect(() => {
    if (saveResult?.success && saveResult !== prevSaveResultRef.current) {
      reset(initialValues)
      clearError()
      onSuccess()
    }
    prevSaveResultRef.current = saveResult
  }, [saveResult, reset, initialValues, clearError, onSuccess])

  // 削除成功時の処理
  const prevDeleteResultRef = useRef<typeof deleteResult>(null)
  useEffect(() => {
    if (deleteResult?.success && deleteResult !== prevDeleteResultRef.current) {
      reset(initialValues)
      clearError()
      onSuccess()
    }
    prevDeleteResultRef.current = deleteResult
  }, [deleteResult, reset, initialValues, clearError, onSuccess])

  const homeroomNameValue = watch('homeroomName') ?? ''
  const gradeIdValue = watch('gradeId') ?? ''
  const homeroomDaysValue = watch('homeroomDays')
  const homeroomIdValue = watch('id') ?? ''

  useEffect(() => {
    if (grades.length === 1 && !gradeIdValue) {
      setValue('gradeId', grades[0].id)
    }
  }, [grades, gradeIdValue, setValue])

  // 削除確認処理
  const handleDeleteClick = () => {
    if (confirm('本当に削除しますか？')) {
      const form = document.getElementById('deleteForm') as HTMLFormElement
      form?.requestSubmit()
    }
  }

  // 閉じる際は状態を初期化
  const handleClose = () => {
    reset(initialValues)
    clearError()
    onClose()
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
        {...register('homeroomName', {
          validate: value =>
            value.trim().length > 0 || '学級名を入力してください',
        })}
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
          {...register('gradeId', {
            validate: value =>
              value.trim().length > 0 || '学年を選択してください',
          })}
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
                {dayOfWeekMap[field.dayOfWeek] || field.dayOfWeek}
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
        {/* 保存フォーム */}
        <form action={saveAction}>
          <input
            type="hidden"
            name="homeroomDays"
            value={JSON.stringify(homeroomDaysValue)}
            readOnly
          />
          <input
            type="hidden"
            {...register('id')}
            value={homeroomIdValue}
            readOnly
          />
          <input
            type="submit"
            value={savePending ? '保存中...' : '保存'}
            className={styles.saveButton}
            disabled={
              savePending || !homeroomNameValue.trim() || !gradeIdValue.trim()
            }
          />
        </form>

        {/* 削除フォーム（編集時のみ表示） */}
        {initialValues.id && (
          <form id="deleteForm" action={deleteAction}>
            <input type="hidden" name="id" value={homeroomIdValue} />
            <input type="hidden" name="gradeId" value={gradeIdValue} />
            <button
              type="button"
              onClick={handleDeleteClick}
              className={styles.deleteButton}
              disabled={deletePending}
            >
              {deletePending ? '削除中...' : '削除'}
            </button>
          </form>
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
