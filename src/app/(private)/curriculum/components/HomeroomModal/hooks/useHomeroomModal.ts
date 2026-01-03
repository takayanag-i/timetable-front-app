import { useState, useEffect, useActionState, useRef, useCallback } from 'react'
import { createHomeroom, updateHomeroom, deleteHomeroom } from '../actions'
import type { ActionResult } from '@/types/server-action-types'

interface UseHomeroomModalArgs {
  mode: 'create' | 'edit'
  homeroomId: string
}

export function useHomeroomModal({ mode, homeroomId }: UseHomeroomModalArgs) {
  // エラーメッセージ
  const [error, setError] = useState<string | null>(null)
  
  // エラーをクリアする
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 前回の値を保持する
  const prevHomeroomIdRef = useRef<string>(homeroomId)
  const prevModeRef = useRef<'create' | 'edit'>(mode)

  // 現在の値が前回の値と変わっていたら、エラーをクリア
  useEffect(() => {
    if (
      prevHomeroomIdRef.current !== homeroomId ||
      prevModeRef.current !== mode
    ) {
      clearError()
      prevHomeroomIdRef.current = homeroomId
      prevModeRef.current = mode
    }
  }, [homeroomId, mode, clearError])

  // Server Action
  const [createResult, createAction, createPending] = useActionState(
    createHomeroom,
    null as ActionResult | null
  )
  const [updateResult, updateAction, updatePending] = useActionState(
    updateHomeroom,
    null as ActionResult | null
  )
  const [deleteResult, deleteAction, deletePending] = useActionState(
    deleteHomeroom,
    null as ActionResult | null
  )

  // 保存（作成または更新）結果を監視してエラーを表示
  useEffect(() => {
    const result = mode === 'create' ? createResult : updateResult

    if (result?.success === false) {
      const defaultMessage =
        mode === 'create'
          ? '学級の作成に失敗しました'
          : '学級の更新に失敗しました'
      setError(
        result.errorCode ? defaultMessage : result.error || defaultMessage
      )
    }
  }, [createResult, updateResult, mode])

  // 削除結果を監視してエラーを表示
  useEffect(() => {
    if (deleteResult?.success === false) {
      const defaultMessage = '学級の削除に失敗しました'
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
