'use client'

import { ConstraintDefinitionForm } from './shared/ConstraintDefinitionForm'
import type { ConstraintDefinitionMasterResponse } from '@/types/graphql-types'
import type { ConstraintDefinitionFormValues } from '@/types/ui-types'
import type { ConstraintDefinition } from '@/core/domain/entity'

interface ConstraintDefinitionRegisterProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  constraintDefinitionMasters: ConstraintDefinitionMasterResponse[]
  existingConstraintDefinitions?: ConstraintDefinition[]
  initialValues: ConstraintDefinitionFormValues
}

/**
 * 制約定義登録コンポーネント（新規作成用）
 */
export function ConstraintDefinitionRegister({
  isOpen,
  onClose,
  onSuccess,
  constraintDefinitionMasters,
  existingConstraintDefinitions = [],
  initialValues,
}: ConstraintDefinitionRegisterProps) {
  return (
    <ConstraintDefinitionForm
      mode="create"
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      constraintDefinitionMasters={constraintDefinitionMasters}
      existingConstraintDefinitions={existingConstraintDefinitions}
      initialValues={initialValues}
    />
  )
}
