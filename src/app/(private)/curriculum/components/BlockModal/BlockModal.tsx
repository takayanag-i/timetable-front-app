'use client'
import { useEffect, useRef, startTransition } from 'react'
import Modal from '@/components/shared/Modal'
import Input from '@/components/shared/Input'
import { useBlockModal } from './hooks/useBlockModal'
import styles from './BlockModal.module.css'
import { useForm } from 'react-hook-form'
import type { BlockFormValues } from './types'

interface BlockModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  homeroomId: string
  blockId: string | null
  initialValues: BlockFormValues
  onSuccess: () => void
  onDeleteSuccess: () => void
  onClose: () => void
}

/**
 * ブロックモーダル
 */
export default function BlockModal({
  isOpen,
  mode,
  homeroomId,
  blockId,
  initialValues,
  onSuccess,
  onDeleteSuccess,
  onClose,
}: BlockModalProps) {
  // カスタムフック
  const {
    error,
    clearError,
    // Server Action
    saveAction,
    savePending,
    saveResult,
    deleteAction,
    deletePending,
    deleteResult,
  } = useBlockModal({
    mode,
    blockId,
    homeroomId,
  })

  // モーダルタイトルの編集
  const modalTitle =
    mode === 'edit'
      ? initialValues.blockName
        ? `${initialValues.blockName}を編集`
        : 'ブロックを編集'
      : 'ブロックを追加'

  // RHFのフック
  const {
    register,
    reset,
    watch,
    trigger,
    formState: { errors },
  } = useForm<BlockFormValues>({
    defaultValues: initialValues,
    mode: 'onChange',
  })

  const blockNameRegister = register('blockName', {
    // 必須チェック
    validate: value =>
      value.trim().length > 0 || 'ブロック名を入力してください',
  })
  const laneCountRegister = register('laneCount', {
    // 数値に変換
    valueAsNumber: true,
    // 必須チェック、数値チェック
    validate: value =>
      !Number.isNaN(value) || 'レーン数を数値で入力してください',
    // 最小値チェック
    min: { value: 1, message: 'レーン数は1以上で入力してください' },
  })

  // モーダルが開いたときに初期値をリセット
  useEffect(() => {
    if (isOpen) {
      reset(initialValues)
      clearError()
    }
  }, [isOpen, reset, initialValues, clearError])

  // 前回の保存結果を保持
  const prevSaveResultRef = useRef<typeof saveResult>(null)

  // 保存成功時の処理
  useEffect(() => {
    if (saveResult?.success && saveResult !== prevSaveResultRef.current) {
      // コールバックを呼び出し
      onSuccess()

      // リセット
      const resetValues: BlockFormValues = {
        ...initialValues,
        blockName: mode === 'create' ? '' : initialValues.blockName,
        laneCount: mode === 'create' ? 1 : initialValues.laneCount,
      }
      reset(resetValues)

      // エラークリア
      clearError()
    }
    prevSaveResultRef.current = saveResult
  }, [saveResult, mode, initialValues, onSuccess, reset, clearError])

  // 前回の削除結果を保持
  const prevDeleteResultRef = useRef<typeof deleteResult>(null)

  // 削除成功時の処理
  useEffect(() => {
    if (deleteResult?.success && deleteResult !== prevDeleteResultRef.current) {
      // コールバックを呼び出し
      onDeleteSuccess()

      // リセット
      reset(initialValues)

      // エラークリア
      clearError()
    }
    prevDeleteResultRef.current = deleteResult
  }, [clearError, initialValues, deleteResult, onDeleteSuccess, reset])

  // モーダルを閉じるときの処理
  const handleClose = () => {
    // リセット
    reset(initialValues)

    // エラークリア
    clearError()

    // コールバックを呼び出し
    onClose()
  }

  // フォームの値を監視
  const blockNameValue = watch('blockName') ?? ''
  const laneCountValue = watch('laneCount') ?? 1

  // 保存処理
  const handleSave = async () => {
    const isValid = await trigger()
    if (!isValid) return

    // FormDataを作成
    const formData = new FormData()
    formData.append('homeroomId', homeroomId)
    formData.append('blockName', blockNameValue.trim())
    if (mode === 'create') {
      formData.append('laneCount', String(laneCountValue))
    }
    if (mode === 'edit' && blockId) {
      formData.append('blockId', blockId)
    }

    // Server Actionを実行
    startTransition(() => {
      saveAction(formData)
    })
  }

  // 削除処理
  const handleDelete = () => {
    if (
      !window.confirm(
        'このブロックを削除すると、ブロック内のレーンや講座も削除されます。本当に削除しますか？'
      )
    ) {
      return
    }

    // FormDataを作成
    const formData = new FormData()
    if (blockId) {
      formData.append('blockId', blockId)
    }

    // Server Actionを実行
    startTransition(() => {
      deleteAction(formData)
    })
  }

  // 保存ボタンの無効化条件
  const isSaveDisabled =
    savePending ||
    !!errors.blockName ||
    !!errors.laneCount ||
    (mode === 'create' && !homeroomId) ||
    (mode === 'edit' && !blockId)

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {/* タイトル */}
      <div className={styles.header}>
        <h2 className={styles.title}>{modalTitle}</h2>
      </div>

      {/* エラー */}
      {error && (
        <div className={styles.errorMessage} role="alert">
          エラー: {error}
        </div>
      )}

      {/* ブロック名 */}
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

      {/* レーン数 */}
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
        <div className={styles.wrapper}>
          <span className={styles.label}>レーン数</span>
          <span className={styles.laneCountDisplay}>
            {initialValues.laneCount}
          </span>
        </div>
      )}

      {/* ボタン群 */}
      <div className={styles.buttonGroup}>
        {/* 保存ボタン */}
        <button
          type="button"
          onClick={handleSave}
          className={styles.saveButton}
          disabled={
            isSaveDisabled ||
            (mode === 'create' && !homeroomId) ||
            (mode === 'edit' && !blockId)
          }
        >
          {savePending ? '保存中...' : '保存'}
        </button>

        {/* 削除ボタン（編集時のみ） */}
        {mode === 'edit' && blockId && (
          <button
            type="button"
            onClick={handleDelete}
            className={styles.deleteButton}
            disabled={deletePending}
          >
            {deletePending ? '削除中...' : '削除'}
          </button>
        )}

        {/* 閉じるボタン */}
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
