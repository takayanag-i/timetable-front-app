import { useForm } from 'react-hook-form'
import { useCallback, useEffect, useMemo } from 'react'
import type { ConstraintDefinitionFormValues } from '@/types/ui-types'
import type {
  ConstraintDefinitionMasterResponse,
  ConstraintParameterMasterResponse,
} from '@/types/graphql-types'
import type { ConstraintDefinition } from '@/core/domain/entity'

interface UseConstraintDefinitionFormProps {
  isOpen: boolean
  initialValues: ConstraintDefinitionFormValues
  constraintDefinitionMasters: ConstraintDefinitionMasterResponse[]
  existingConstraintDefinitions?: ConstraintDefinition[]
  constraintDefinitionId?: string
}

/**
 * 制約定義フォームのカスタムフック
 */
export function useConstraintDefinitionForm({
  isOpen,
  initialValues,
  constraintDefinitionMasters,
  existingConstraintDefinitions = [],
  constraintDefinitionId,
}: UseConstraintDefinitionFormProps) {
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
  const selectedParameterMasters = useMemo<ConstraintParameterMasterResponse[]>(
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

  // モーダルが開いたときに初期値をリセット
  const resetFormState = useCallback(() => {
    reset(initialValues)
  }, [reset, initialValues])

  useEffect(() => {
    if (isOpen) {
      resetFormState()
    }
  }, [isOpen, resetFormState])

  // フォームの妥当性チェック
  const isFormValid =
    !!constraintDefinitionCodeValue &&
    (softFlagValue ? !!penaltyWeightValue : true)

  return {
    // Form control
    watch,
    setValue,
    reset,
    resetFormState,
    errors,
    // Form values
    constraintDefinitionCodeValue,
    softFlagValue,
    penaltyWeightValue,
    parametersValue,
    // Derived values
    selectedParameterMasters,
    existingSoftConstraints,
    isFormValid,
  }
}
