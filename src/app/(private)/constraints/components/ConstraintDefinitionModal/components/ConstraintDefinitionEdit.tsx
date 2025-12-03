'use client'

import { ConstraintDefinitionForm } from './shared/ConstraintDefinitionForm'
import type { ConstraintDefinitionMasterResponse } from '@/types/graphql-types'
import type { ConstraintDefinitionFormValues } from '@/types/ui-types'
import type { ConstraintDefinition } from '@/core/domain/entity'

interface ConstraintDefinitionEditProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  constraintDefinitionId: string
  constraintDefinitionMasters: ConstraintDefinitionMasterResponse[]
  existingConstraintDefinitions?: ConstraintDefinition[]
  initialValues: ConstraintDefinitionFormValues
}

/**
 * 制約定義編集コンポーネント
 * - 制約定義コードは変更不可（disabled）
 */
export function ConstraintDefinitionEdit({
  isOpen,
  onClose,
  onSuccess,
  constraintDefinitionId,
  constraintDefinitionMasters,
  existingConstraintDefinitions = [],
  initialValues,
}: ConstraintDefinitionEditProps) {
  return (
    <ConstraintDefinitionForm
      mode="edit"
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      constraintDefinitionId={constraintDefinitionId}
      constraintDefinitionMasters={constraintDefinitionMasters}
      existingConstraintDefinitions={existingConstraintDefinitions}
      initialValues={initialValues}
    />
  )
}
