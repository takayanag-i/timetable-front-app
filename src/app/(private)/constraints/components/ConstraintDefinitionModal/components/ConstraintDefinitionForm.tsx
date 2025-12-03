'use client'

import { useCallback } from 'react'
import styles from '../../ConstraintDefinitionModal.module.css'
import { ConstraintSelectField } from './ConstraintSelectField'
import { SoftConstraintCheckbox } from './SoftConstraintCheckbox'
import { PenaltyWeightSlider } from './PenaltyWeightSlider'
import { ParametersField } from './ParametersField'
import { useConstraintDefinitionForm } from '../../hooks/useConstraintDefinitionForm'
import { useConstraintDefinitionActions } from '../../hooks/useConstraintDefinitionActions'
import type { ConstraintDefinitionMasterResponse } from '@/types/graphql-types'
import type { ConstraintDefinitionFormValues } from '@/types/ui-types'
import type { ConstraintDefinition } from '@/core/domain/entity'

interface ConstraintDefinitionFormProps {
  mode: 'create' | 'edit'
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  constraintDefinitionId?: string
  constraintDefinitionMasters: ConstraintDefinitionMasterResponse[]
  existingConstraintDefinitions?: ConstraintDefinition[]
  initialValues: ConstraintDefinitionFormValues
}

/**
 * 制約定義フォーム共通コンポーネント
 */
export function ConstraintDefinitionForm({
  mode,
  isOpen,
  onClose,
  onSuccess,
  constraintDefinitionId,
  constraintDefinitionMasters,
  existingConstraintDefinitions = [],
  initialValues,
}: ConstraintDefinitionFormProps) {
  const {
    setValue,
    resetFormState,
    errors,
    constraintDefinitionCodeValue,
    softFlagValue,
    penaltyWeightValue,
    parametersValue,
    selectedParameterMasters,
    existingSoftConstraints,
    isFormValid,
  } = useConstraintDefinitionForm({
    isOpen,
    initialValues,
    constraintDefinitionMasters,
    existingConstraintDefinitions,
    constraintDefinitionId,
  })

  const { error, isPending, createAction, updateAction, deleteAction } =
    useConstraintDefinitionActions({
      mode,
      onSuccess,
      resetFormState,
    })

  const handleClose = useCallback(() => {
    resetFormState()
    onClose()
  }, [resetFormState, onClose])

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
  const submitAction = isEditMode ? updateAction : createAction
  const submitButtonText = isEditMode ? '更新' : '作成'
  const submitButtonLoadingText = isEditMode ? '更新中...' : '作成中...'

  return (
    <>
      {error && <div className={styles.error}>{error}</div>}

      <form action={submitAction!} className={styles.form}>
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
    </>
  )
}
