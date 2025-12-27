import { useState, useEffect, useActionState, useRef, useCallback } from 'react'
import { createBlock, updateBlock, deleteBlock } from '../actions'
import type { ActionResult } from '@/types/server-action-types'

interface UseBlockModalArgs {
  homeroomId: string | null
  mode: 'create' | 'edit'
  blockId: string | null
}

export function useBlockModal({
  homeroomId,
  mode,
  blockId,
}: UseBlockModalArgs) {
  // エラーメッセージ
  const [error, setError] = useState<string | null>(null)

  const prevHomeroomIdRef = useRef<string | null>(null)
  const prevBlockIdRef = useRef<string | null>(null)
  const prevModeRef = useRef<'create' | 'edit'>(mode)

  useEffect(() => {
    if (
      prevHomeroomIdRef.current !== homeroomId ||
      prevBlockIdRef.current !== blockId ||
      prevModeRef.current !== mode
    ) {
      setError(null)
      prevHomeroomIdRef.current = homeroomId
      prevBlockIdRef.current = blockId
      prevModeRef.current = mode
    }
  }, [blockId, homeroomId, mode])

  // Server Action
  const [createResult, createAction, createPending] = useActionState(
    createBlock,
    null
  )
  const [updateResult, updateAction, updatePending] = useActionState(
    updateBlock,
    null as ActionResult | null
  )
  const [deleteResult, deleteAction, deletePending] = useActionState(
    deleteBlock,
    null as ActionResult | null
  )

  // 保存結果を監視してエラーを表示
  useEffect(() => {
    const result = mode === 'create' ? createResult : updateResult

    if (result?.success === false) {
      setError(
        result.error ||
          (mode === 'create'
            ? 'ブロックの作成に失敗しました'
            : 'ブロックの更新に失敗しました')
      )
    }
  }, [createResult, mode, updateResult])

  useEffect(() => {
    if (deleteResult?.success === false) {
      setError(deleteResult.error || 'ブロックの削除に失敗しました')
    }
  }, [deleteResult])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    clearError,
    saveAction: mode === 'create' ? createAction : updateAction,
    savePending: mode === 'create' ? createPending : updatePending,
    saveResult: mode === 'create' ? createResult : updateResult,
    deleteAction,
    deletePending,
    deleteResult,
  }
}
