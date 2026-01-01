import { useState, useEffect, useActionState, useRef, useCallback } from 'react'
import { createCourse } from '../actions'
import type { ActionResult } from '@/types/server-action-types'

interface UseCourseAddOrChangeArgs {
  laneId: string
}

export function useCourseAddOrChange({ laneId }: UseCourseAddOrChangeArgs) {
  // エラーメッセージ
  const [error, setError] = useState<string | null>(null)

  // エラーをクリアする
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 前回の値を保持する
  const prevLaneIdRef = useRef<string | undefined>(laneId)

  // 現在の値が前回の値と変わっていたら、エラーをクリア
  useEffect(() => {
    if (prevLaneIdRef.current !== laneId) {
      clearError()
      prevLaneIdRef.current = laneId
    }
  }, [laneId, clearError])

  // Server Action
  const [createResult, createAction, isCreating] = useActionState(
    createCourse,
    null as ActionResult | null
  )

  // 保存（作成）を監視してエラーを表示
  useEffect(() => {
    if (createResult?.success === false) {
      setError(createResult.error || '講座の作成に失敗しました')
    }
  }, [createResult])

  const setErrorWrapper = useCallback((message: string) => {
    setError(message)
  }, [])

  return {
    error,
    clearError,
    setError: setErrorWrapper, // TODO 参照安定化の問題
    createAction,
    createPending: isCreating,
    createResult,
  }
}
