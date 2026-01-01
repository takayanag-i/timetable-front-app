import { useState, useEffect, useActionState, useRef, useCallback } from 'react'
import { updateCourse, removeCourseFromLane } from '../actions'
import type { ActionResult } from '@/types/server-action-types'

interface UseCourseCurrentArgs {
  laneId: string
  courseId: string
}

/**
 * 現在の講座を編集コンポーネントのカスタムフック
 */
export function useCourseCurrent({ laneId, courseId }: UseCourseCurrentArgs) {
  // エラーメッセージ
  const [error, setError] = useState<string | null>(null)

  // エラーをクリアする
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 前回の値を保持する
  const prevLaneIdRef = useRef<string>(laneId)
  const prevCourseIdRef = useRef<string>(courseId)

  // 現在の値が前回の値と変わっていたら、エラーをクリア
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

  // Server Action
  const [updateResult, updateAction, isUpdating] = useActionState(
    updateCourse,
    null as ActionResult | null
  )
  const [removeResult, removeAction, isRemoving] = useActionState(
    removeCourseFromLane,
    null as ActionResult | null
  )

  // 保存（編集）結果を監視してエラーを表示
  useEffect(() => {
    if (updateResult?.success === false) {
      setError(updateResult.error || '講座の更新に失敗しました')
    }
  }, [updateResult])

  // 削除結果を監視してエラーを表示
  useEffect(() => {
    if (removeResult?.success === false) {
      setError(removeResult.error || '講座の削除に失敗しました')
    }
  }, [removeResult])

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
