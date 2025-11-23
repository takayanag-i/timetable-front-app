'use client'
import { useEffect, useMemo, useRef } from 'react'
import type { FormEvent } from 'react'
import Modal from '@/components/shared/Modal'
import Input from '@/components/shared/Input'
import { useBlockModal } from './hooks/useBlockModal'
import styles from './BlockModal.module.css'
import { useForm } from 'react-hook-form'

/**
 * BlockModal コンポーネントのProps
 */
interface Props {
  /** モーダルの表示状態 */
  isOpen: boolean
  /** モーダルのモード */
  mode: 'create' | 'edit'
  /** モーダルのタイトル（任意） */
  title?: string
  /** 学級ID */
  homeroomId: string | null
  /** ブロックID（編集時のみ） */
  blockId?: string | null
  /** 初期ブロック名（編集時のみ） */
  initialBlockName?: string
  /** 初期レーン数（編集時のみ表示） */
  initialLaneCount?: number
  /** 処理成功時のコールバック */
  onSuccess: () => void
  /** 削除成功時のコールバック */
  onDeleteSuccess?: () => void
  /** モーダルを閉じる際のコールバック */
  onClose: () => void
}

/** ブロック追加/編集モーダル。RHF を使いつつネイティブ submit で Server Action を呼ぶ */
export default function BlockModal({
  isOpen,
  mode,
  title,
  homeroomId,
  blockId,
  initialBlockName,
  initialLaneCount,
  onSuccess,
  onDeleteSuccess,
  onClose,
}: Props) {
  // 統合されたカスタムフック（Server Action処理 + エラーハンドリング）
  const {
    error,
    // Server Action
    saveAction,
    savePending,
    saveResult,
    deleteAction,
    deletePending,
    deleteResult,
    clearError,
  } = useBlockModal({
    homeroomId,
    mode,
    blockId: blockId ?? null,
  })

  // タイトルは mode/初期値から動的に組み立てる
  const modalTitle =
    title ??
    (mode === 'edit'
      ? initialBlockName
        ? `${initialBlockName}を編集`
        : 'ブロックを編集'
      : 'ブロックを追加')

  /** RHF で扱うフィールド定義（hidden で送る ID も含む） */
  type BlockFormValues = {
    blockName: string
    laneCount: number
    homeroomId: string
    blockId: string
  }

  // モーダルの初期値（mode/props 依存）
  const defaultValues = useMemo<BlockFormValues>(
    () => ({
      blockName: initialBlockName ?? '',
      laneCount:
        mode === 'edit' && initialLaneCount ? Math.max(1, initialLaneCount) : 1,
      homeroomId: homeroomId ?? '',
      blockId: blockId ?? '',
    }),
    [blockId, homeroomId, initialBlockName, initialLaneCount, mode]
  )

  // RHF hooks
  const {
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<BlockFormValues>({
    defaultValues,
    mode: 'onChange',
  })

  const blockNameRegister = register('blockName', {
    validate: value =>
      value.trim().length > 0 || 'ブロック名を入力してください',
  })
  const laneCountRegister = register('laneCount', {
    valueAsNumber: true,
    min: { value: 1, message: 'レーン数は1以上で入力してください' },
    setValueAs: value => {
      const parsed = parseInt(value, 10)
      if (Number.isNaN(parsed)) return 1
      return Math.max(1, parsed)
    },
  })
  const homeroomIdRegister = register('homeroomId')
  const blockIdRegister = register('blockId')

  // props 変更時にフォームを初期化
  useEffect(() => {
    reset(defaultValues)
    clearError()
  }, [defaultValues, reset, clearError])

  // Button の制御用に各フィールドの値を取得
  const blockNameValue = watch('blockName') ?? ''
  const laneCountValue = watch('laneCount') ?? 1
  const homeroomIdValue = watch('homeroomId')
  const blockIdValue = watch('blockId')

  const prevSaveResultRef = useRef<typeof saveResult>(null)
  // 保存成功時のリセット
  useEffect(() => {
    if (saveResult?.success && saveResult !== prevSaveResultRef.current) {
      onSuccess()
      reset({
        ...defaultValues,
        blockName: mode === 'create' ? '' : defaultValues.blockName,
        laneCount:
          mode === 'create' ? 1 : defaultValues.laneCount || laneCountValue,
      })
      clearError()
    }
    prevSaveResultRef.current = saveResult
  }, [
    clearError,
    defaultValues,
    laneCountValue,
    mode,
    onSuccess,
    reset,
    saveResult,
  ])

  // 削除成功時も同様にリセット
  const prevDeleteResultRef = useRef<typeof deleteResult>(null)
  useEffect(() => {
    if (deleteResult?.success && deleteResult !== prevDeleteResultRef.current) {
      onDeleteSuccess?.()
      reset(defaultValues)
      clearError()
    } else if (deleteResult?.success === false) {
      // 削除失敗時はエラー表示を保持するためリセットしない
    }
    prevDeleteResultRef.current = deleteResult
  }, [clearError, defaultValues, deleteResult, onDeleteSuccess, reset])

  // 閉じる際は状態を初期化
  const handleClose = () => {
    reset(defaultValues)
    clearError()
    onClose()
  }

  // ネイティブ confirm で削除確認
  const handleDeleteSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (
      !window.confirm(
        'このブロックを削除すると、ブロック内のレーンや講座も削除されます。本当に削除しますか？'
      )
    ) {
      event.preventDefault()
    }
  }

  // 保存ボタンの無効化条件
  const isSaveDisabled =
    savePending ||
    !blockNameValue.trim() ||
    (mode === 'create' && (!homeroomIdValue || laneCountValue < 1)) ||
    (mode === 'edit' && !blockIdValue)

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {/* タイトル表示 */}
      <div className={styles.header}>{modalTitle}</div>

      {/* エラー表示 */}
      {error && <div className={styles.errorMessage}>エラー: {error}</div>}

      {/* RHF + ネイティブ submit のフォーム */}
      <form action={saveAction}>
        <input
          type="hidden"
          {...homeroomIdRegister}
          value={homeroomIdValue}
          readOnly
        />
        <input
          type="hidden"
          {...blockIdRegister}
          value={blockIdValue}
          readOnly
        />

        {/* ブロック名入力 */}
        <Input
          id="blockName"
          label="ブロック名"
          placeholder="ブロック名を入力"
          {...blockNameRegister}
          aria-invalid={errors.blockName ? 'true' : 'false'}
        />
        {errors.blockName && (
          <p className={styles.fieldError}>{errors.blockName.message}</p>
        )}

        {/* レーン数（作成時のみ editable） */}
        {mode === 'create' ? (
          <>
            <Input
              id="laneCount"
              type="number"
              min={1}
              label="レーン数"
              placeholder="レーン数を入力"
              {...laneCountRegister}
              aria-invalid={errors.laneCount ? 'true' : 'false'}
            />
            {errors.laneCount && (
              <p className={styles.fieldError}>{errors.laneCount.message}</p>
            )}
          </>
        ) : (
          <>
            <div className={styles.wrapper}>
              <span className={styles.label}>レーン数</span>
              <span className={styles.laneCountDisplay}>
                {laneCountValue ?? 1}
              </span>
            </div>
            <input
              type="hidden"
              {...laneCountRegister}
              value={laneCountValue ?? 1}
              readOnly
            />
          </>
        )}

        <div className={styles.buttonGroup}>
          <input
            type="submit"
            value={savePending ? '保存中...' : '保存'}
            className={styles.saveButton}
            disabled={
              isSaveDisabled ||
              (mode === 'create' && !homeroomId) ||
              (mode === 'edit' && !blockId)
            }
          />

          <button
            type="button"
            onClick={handleClose}
            className={styles.cancelButton}
          >
            閉じる
          </button>
        </div>
      </form>

      {mode === 'edit' && blockId && (
        <form action={deleteAction} onSubmit={handleDeleteSubmit}>
          <input type="hidden" name="blockId" value={blockId} />
          <button
            type="submit"
            className={styles.deleteButton}
            disabled={deletePending}
          >
            {deletePending ? '削除中...' : '削除'}
          </button>
        </form>
      )}
    </Modal>
  )
}
