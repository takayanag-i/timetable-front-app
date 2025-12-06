'use client'

import Modal from '@/components/shared/Modal'
import styles from './ConstraintDefinitionModal.module.css'
import { ConstraintDefinitionForm } from './components/ConstraintDefinitionForm'
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
  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <ConstraintDefinitionForm
        mode={mode}
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
        constraintDefinitionId={constraintDefinitionId}
        constraintDefinitionMasters={constraintDefinitionMasters}
        existingConstraintDefinitions={existingConstraintDefinitions}
        initialValues={initialValues}
      />
    </Modal>
  )
}
