'use client'

import { useCallback, useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import Modal from '@/components/shared/Modal'
import styles from './ConstraintDefinitionModal.module.css'
import { ConstraintSelectField } from './components/ConstraintSelectField'
import { SoftConstraintCheckbox } from './components/SoftConstraintCheckbox'
import { PenaltyWeightSlider } from './components/PenaltyWeightSlider'
import { ParametersField } from './components/ParametersField'
import { useConstraintDefinitionModal } from './hooks/useConstraintDefinitionModal'
import type { ConstraintDefinitionMasterResponse } from '@/types/graphql-types'
import type { ConstraintDefinitionFormValues } from '@/types/ui-types'
import type { ConstraintDefinition } from '@/core/domain/entity'

interface ConstraintDefinitionModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  title: string
  constraintDefinitionId?: string
  constraintDefinitionMasters: ConstraintDefinitionMasterResponse[]
  existingConstraintDefinitions?: ConstraintDefinition[]
  initialValues: ConstraintDefinitionFormValues
  onSuccess: () => void
  onClose: () => void
}

/**
 * 制約定義モーダル（新規作成・編集）
 */
export default function ConstraintDefinitionModal({
  isOpen,
  mode,
  title,
  constraintDefinitionId,
  constraintDefinitionMasters,
  existingConstraintDefinitions = [],
  initialValues,
  onSuccess,
  onClose,
}: ConstraintDefinitionModalProps) {
  const {
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ConstraintDefinitionFormValues>({
    defaultValues: initialValues,
    mode: 'onChange',
  })

  const constraintDefinitionCodeValue = watch('constraintDefinitionCode')
  const softFlagValue = watch('softFlag')
  const penaltyWeightValue = watch('penaltyWeight')
  const parametersValue = watch('parameters')

  // 選択された制約定義コードに対応するパラメータマスタを取得
  const selectedParameterMasters = useMemo(
    () =>
      constraintDefinitionMasters.find(
        m => m.constraintDefinitionCode === constraintDefinitionCodeValue
      )?.parameterMasters || [],
    [constraintDefinitionMasters, constraintDefinitionCodeValue]
  )

  // 既存のソフト制約を取得（同じ制約定義コードで、ソフト制約のもの）
  const existingSoftConstraints = useMemo(
    () =>
      existingConstraintDefinitions.filter(cd => {
        // 編集モードの場合は自分自身を除外
        if (constraintDefinitionId && cd.id === constraintDefinitionId) {
          return false
        }
        return (
          cd.constraintDefinitionCode === constraintDefinitionCodeValue &&
          cd.softFlag === true
        )
      }),
    [
      existingConstraintDefinitions,
      constraintDefinitionCodeValue,
      constraintDefinitionId,
    ]
  )

  // フォームの妥当性チェック
  const isFormValid =
    !!constraintDefinitionCodeValue &&
    (softFlagValue ? !!penaltyWeightValue : true)

  // モーダルが開いたときに初期値をリセット
  const resetFormState = useCallback(() => {
    reset(initialValues)
  }, [reset, initialValues])

  const {
    error,
    clearError,
    saveAction,
    savePending,
    saveResult,
    deleteAction,
    deletePending,
    deleteResult,
  } = useConstraintDefinitionModal({
    mode,
    constraintDefinitionId,
  })

  useEffect(() => {
    if (isOpen) {
      resetFormState()
      clearError()
    }
  }, [isOpen, resetFormState, clearError])

  // 成功時の処理
  const prevSaveResultRef = useRef<typeof saveResult>(null)
  useEffect(() => {
    if (saveResult?.success && saveResult !== prevSaveResultRef.current) {
      resetFormState()
      clearError()
      onSuccess()
    }
    prevSaveResultRef.current = saveResult
  }, [saveResult, resetFormState, clearError, onSuccess])

  const prevDeleteResultRef = useRef<typeof deleteResult>(null)
  useEffect(() => {
    if (deleteResult?.success && deleteResult !== prevDeleteResultRef.current) {
      resetFormState()
      clearError()
      onSuccess()
    }
    prevDeleteResultRef.current = deleteResult
  }, [deleteResult, resetFormState, clearError, onSuccess])

  // 閉じる際は状態を初期化
  const handleClose = useCallback(() => {
    resetFormState()
    clearError()
    onClose()
  }, [resetFormState, clearError, onClose])

  const handleConstraintChange = useCallback(
    (value: string) => {
      setValue('constraintDefinitionCode', value)
      // 選択された制約定義コードに応じてsoftFlagを設定
      const selectedMaster = constraintDefinitionMasters.find(
        m => m.constraintDefinitionCode === value
      )
      if (selectedMaster) {
        setValue('softFlag', selectedMaster.softFlag)
      }
    },
    [setValue, constraintDefinitionMasters]
  )

  const isEditMode = mode === 'edit'
  const submitButtonText = isEditMode ? '更新' : '作成'
  const submitButtonLoadingText = isEditMode ? '更新中...' : '作成中...'
  const isPending = savePending || deletePending

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          エラー: {error}
        </div>
      )}

      <form action={saveAction} className={styles.form}>
        {isEditMode && (
          <input type="hidden" name="id" value={constraintDefinitionId} />
        )}
        <input
          type="hidden"
          name="constraintDefinitionCode"
          value={constraintDefinitionCodeValue}
        />
        <input type="hidden" name="softFlag" value={softFlagValue.toString()} />
        <input type="hidden" name="penaltyWeight" value={penaltyWeightValue} />
        <input type="hidden" name="parameters" value={parametersValue} />

        {/* 制約フィールド */}
        <ConstraintSelectField
          value={constraintDefinitionCodeValue}
          onChange={handleConstraintChange}
          constraintDefinitionMasters={constraintDefinitionMasters}
          disabled={isPending}
          error={errors.constraintDefinitionCode?.message}
          isEditMode={isEditMode}
        />

        {/* ソフト制約フィールド */}
        <SoftConstraintCheckbox
          checked={softFlagValue}
          onChange={checked => setValue('softFlag', checked)}
          disabled={isPending}
        />

        {/* 重みフィールド */}
        {softFlagValue && (
          <PenaltyWeightSlider
            value={penaltyWeightValue}
            onChange={value => setValue('penaltyWeight', value)}
            existingSoftConstraints={existingSoftConstraints}
            disabled={isPending}
          />
        )}

        {/* パラメータフィールド */}
        <ParametersField
          selectedParameterMasters={selectedParameterMasters}
          parametersValue={parametersValue}
          onChange={value => setValue('parameters', value)}
          disabled={isPending}
        />

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
            {isPending ? submitButtonLoadingText : submitButtonText}
          </button>
        </div>
      </form>

      {/* 削除用の独立したフォーム（編集モードのみ） */}
      {isEditMode && deleteAction && (
        <form
          action={deleteAction}
          onSubmit={e => {
            if (!confirm('本当にこの制約定義を削除しますか？')) {
              e.preventDefault()
            }
          }}
          className={styles.deleteForm}
        >
          <input type="hidden" name="id" value={constraintDefinitionId} />
          <button
            type="submit"
            className={styles.deleteButton}
            disabled={isPending}
          >
            削除
          </button>
        </form>
      )}
    </Modal>
  )
}
