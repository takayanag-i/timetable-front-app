import { useState, useEffect, useActionState, useRef, useCallback } from 'react'
import { createBlock, updateBlock, deleteBlock } from '../actions'
import type { ActionResult } from '@/types/server-action-types'

interface UseBlockModalArgs {
  mode: 'create' | 'edit'
  blockId: string | null
  homeroomId: string
}

export function useBlockModal({
  mode,
  blockId,
  homeroomId,
}: UseBlockModalArgs) {
  // エラーメッセージ
  const [error, setError] = useState<string | null>(null)

  // エラーをクリアする
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 前回の値を保持する
  const prevHomeroomIdRef = useRef<string>(homeroomId)
  const prevBlockIdRef = useRef<string | null>(null)
  const prevModeRef = useRef<'create' | 'edit'>(mode)

  // 現在の値が前回の値と変わっていたら、エラーをクリア
  useEffect(() => {
    if (
      prevHomeroomIdRef.current !== homeroomId ||
      prevBlockIdRef.current !== blockId ||
      prevModeRef.current !== mode
    ) {
      clearError()
      prevHomeroomIdRef.current = homeroomId
      prevBlockIdRef.current = blockId
      prevModeRef.current = mode
    }
  }, [blockId, homeroomId, mode, clearError])

  // Server Action
  const [createResult, createAction, createPending] = useActionState(
    createBlock,
    null as ActionResult | null
  )
  const [updateResult, updateAction, updatePending] = useActionState(
    updateBlock,
    null as ActionResult | null
  )
  const [deleteResult, deleteAction, deletePending] = useActionState(
    deleteBlock,
    null as ActionResult | null
  )

  // 保存（作成または更新）結果を監視してエラーを表示
  useEffect(() => {
    const result = mode === 'create' ? createResult : updateResult

    if (result?.success === false) {
      const defaultMessage =
        mode === 'create'
          ? 'ブロックの作成に失敗しました'
          : 'ブロックの更新に失敗しました'
      setError(
        result.errorCode ? defaultMessage : result.error || defaultMessage
      )
    }
  }, [createResult, updateResult, mode])

  // 削除結果を監視してエラーを表示
  useEffect(() => {
    if (deleteResult?.success === false) {
      const defaultMessage = 'ブロックの削除に失敗しました'
      setError(
        deleteResult.errorCode
          ? defaultMessage
          : deleteResult.error || defaultMessage
      )
    }
  }, [deleteResult])

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
