import { useState, useEffect, useActionState, useRef, useCallback } from 'react'
import { updateCourse, removeCourseFromLane } from '../actions'
import type { ActionResult } from '@/types/bff-types'

interface UseCourseCurrentArgs {
  laneId: string
  courseId: string
}

export function useCourseCurrent({ laneId, courseId }: UseCourseCurrentArgs) {
  const [error, setError] = useState<string | null>(null)

  const prevLaneIdRef = useRef<string>(laneId)
  const prevCourseIdRef = useRef<string>(courseId)

  useEffect(() => {
    if (
      prevLaneIdRef.current !== laneId ||
      prevCourseIdRef.current !== courseId
    ) {
      setError(null)
      prevLaneIdRef.current = laneId
      prevCourseIdRef.current = courseId
    }
  }, [laneId, courseId])

  const [updateResult, updateAction, isUpdating] = useActionState(
    updateCourse,
    null as ActionResult | null
  )
  const [removeResult, removeAction, isRemoving] = useActionState(
    removeCourseFromLane,
    null as ActionResult | null
  )

  // 保存結果を監視してエラーを表示
  useEffect(() => {
    if (updateResult?.success === false) {
      setError(updateResult.error || '講座の更新に失敗しました')
    }
  }, [updateResult])

  useEffect(() => {
    if (removeResult?.success === false) {
      setError(removeResult.error || '講座の削除に失敗しました')
    }
  }, [removeResult])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    clearError,
    updateAction,
    updatePending: isUpdating,
    updateResult,
    removeAction,
    removePending: isRemoving,
    removeResult,
  }
}
