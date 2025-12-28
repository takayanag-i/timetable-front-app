import { useState, useEffect, useActionState, useRef, useCallback } from 'react'
import { createCourse } from '../actions'
import type { ActionResult } from '@/types/server-action-types'

interface UseCourseAddOrChangeArgs {
  laneId?: string
  blockId?: string
}

export function useCourseAddOrChange({
  laneId,
  blockId,
}: UseCourseAddOrChangeArgs) {
  const [error, setError] = useState<string | null>(null)

  const prevLaneIdRef = useRef<string | undefined>(laneId)
  const prevBlockIdRef = useRef<string | undefined>(blockId)

  useEffect(() => {
    if (
      prevLaneIdRef.current !== laneId ||
      prevBlockIdRef.current !== blockId
    ) {
      setError(null)
      prevLaneIdRef.current = laneId
      prevBlockIdRef.current = blockId
    }
  }, [laneId, blockId])

  const [createResult, createAction, isCreating] = useActionState(
    createCourse,
    null as ActionResult | null
  )

  // 保存結果を監視してエラーを表示
  useEffect(() => {
    if (createResult?.success === false) {
      setError(createResult.error || '講座の作成に失敗しました')
    }
  }, [createResult])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const setErrorManually = useCallback((message: string) => {
    setError(message)
  }, [])

  return {
    error,
    clearError,
    setError: setErrorManually,
    createAction,
    createPending: isCreating,
    createResult,
  }
}
