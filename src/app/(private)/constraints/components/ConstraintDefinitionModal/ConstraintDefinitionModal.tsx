'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/shared/Modal'
import styles from './ConstraintDefinitionModal.module.css'
import { ConstraintDefinitionEdit } from './components/ConstraintDefinitionEdit'
import { ConstraintDefinitionRegister } from './components/ConstraintDefinitionRegister'
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
  // モーダルが開いたときに状態をリセット
  useEffect(() => {
    if (isOpen && mode === 'edit') {
      // 編集モードの初期化処理があればここに記述
    }
  }, [isOpen, mode])

  if (!isOpen) return null

  // 編集モード
  if (mode === 'edit' && constraintDefinitionId) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <ConstraintDefinitionEdit
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

  // 新規作成モード
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <ConstraintDefinitionRegister
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
        constraintDefinitionMasters={constraintDefinitionMasters}
        existingConstraintDefinitions={existingConstraintDefinitions}
        initialValues={initialValues}
      />
    </Modal>
  )
}
