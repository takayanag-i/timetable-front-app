import { useState, useActionState, useEffect, useRef, useCallback } from 'react'
import {
  createConstraintDefinition,
  updateConstraintDefinition,
  deleteConstraintDefinition,
} from '../actions'
import type { ActionResult } from '@/types/bff-types'

interface UseConstraintDefinitionModalProps {
  mode: 'create' | 'edit'
  constraintDefinitionId?: string
}

/**
 * 制約定義モーダルのサーバーアクションとエラー処理を管理するカスタムフック
 */
export function useConstraintDefinitionModal({
  mode,
  constraintDefinitionId,
}: UseConstraintDefinitionModalProps) {
  const [error, setError] = useState<string | null>(null)

  const prevIdRef = useRef<string | undefined>(constraintDefinitionId)
  const prevModeRef = useRef<'create' | 'edit'>(mode)

  useEffect(() => {
    if (
      prevIdRef.current !== constraintDefinitionId ||
      prevModeRef.current !== mode
    ) {
      setError(null)
      prevIdRef.current = constraintDefinitionId
      prevModeRef.current = mode
    }
  }, [constraintDefinitionId, mode])

  // 新規作成モード
  const [createResult, createAction, isCreating] = useActionState(
    createConstraintDefinition,
    null
  )

  // 編集モード
  const [updateResult, updateAction, isUpdating] = useActionState(
    updateConstraintDefinition,
    null as ActionResult | null
  )
  const [deleteResult, deleteAction, isDeleting] = useActionState(
    deleteConstraintDefinition,
    null as ActionResult | null
  )

  // 保存結果を監視してエラーを表示
  useEffect(() => {
    const result = mode === 'create' ? createResult : updateResult

    if (result?.success === false) {
      setError(
        result.error ||
          (mode === 'create'
            ? '制約定義の作成に失敗しました'
            : '制約定義の更新に失敗しました')
      )
    }
  }, [createResult, mode, updateResult])

  useEffect(() => {
    if (deleteResult?.success === false) {
      setError(deleteResult.error || '制約定義の削除に失敗しました')
    }
  }, [deleteResult])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    clearError,
    saveAction: mode === 'create' ? createAction : updateAction,
    savePending: mode === 'create' ? isCreating : isUpdating,
    saveResult: mode === 'create' ? createResult : updateResult,
    deleteAction,
    deletePending: isDeleting,
    deleteResult,
  }
}
