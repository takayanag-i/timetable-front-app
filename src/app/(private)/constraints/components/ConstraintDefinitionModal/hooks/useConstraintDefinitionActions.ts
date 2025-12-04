import { useState, useActionState, useEffect, useRef } from 'react'
import {
  createConstraintDefinition,
  updateConstraintDefinition,
  deleteConstraintDefinition,
} from '../actions'

interface UseConstraintDefinitionActionsProps {
  mode: 'create' | 'edit'
  onSuccess?: () => void
  resetFormState: () => void
}

/**
 * 制約定義のサーバーアクションとエラー処理を管理するカスタムフック
 */
export function useConstraintDefinitionActions({
  mode,
  onSuccess,
  resetFormState,
}: UseConstraintDefinitionActionsProps) {
  const [error, setError] = useState<string | null>(null)

  // 新規作成モード
  const [createResult, createAction, isCreating] = useActionState(
    createConstraintDefinition,
    null
  )

  // 編集モード
  const [updateResult, updateAction, isUpdating] = useActionState(
    updateConstraintDefinition,
    null
  )
  const [deleteResult, deleteAction, isDeleting] = useActionState(
    deleteConstraintDefinition,
    null
  )

  const isPending = isCreating || isUpdating || isDeleting

  // エラー処理
  useEffect(() => {
    if (createResult && !createResult.success) {
      setError(createResult.error)
    } else if (updateResult && !updateResult.success) {
      setError(updateResult.error)
    } else if (deleteResult && !deleteResult.success) {
      setError(deleteResult.error)
    }
  }, [createResult, updateResult, deleteResult])

  // 作成成功時の処理
  const prevCreateSuccessRef = useRef(false)
  useEffect(() => {
    const createSuccess = Boolean(createResult?.success)
    if (createSuccess && !prevCreateSuccessRef.current) {
      resetFormState()
      onSuccess?.()
    }
    prevCreateSuccessRef.current = createSuccess
  }, [createResult?.success, resetFormState, onSuccess])

  // 更新成功時の処理
  const prevUpdateSuccessRef = useRef(false)
  useEffect(() => {
    const updateSuccess = Boolean(updateResult?.success)
    if (updateSuccess && !prevUpdateSuccessRef.current) {
      resetFormState()
      onSuccess?.()
    }
    prevUpdateSuccessRef.current = updateSuccess
  }, [updateResult?.success, resetFormState, onSuccess])

  // 削除成功時の処理
  const prevDeleteSuccessRef = useRef(false)
  useEffect(() => {
    const deleteSuccess = Boolean(deleteResult?.success)
    if (deleteSuccess && !prevDeleteSuccessRef.current) {
      resetFormState()
      onSuccess?.()
    }
    prevDeleteSuccessRef.current = deleteSuccess
  }, [deleteResult?.success, resetFormState, onSuccess])

  return {
    // State
    error,
    isPending,
    // Actions
    createAction: mode === 'create' ? createAction : null,
    updateAction: mode === 'edit' ? updateAction : null,
    deleteAction: mode === 'edit' ? deleteAction : null,
  }
}
