import {
  useState,
  useEffect,
  useActionState,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import type { HomeroomDay } from '@/core/domain/entity'
import type { HomeroomModalData } from '@/types/ui-types'
import { createHomeroom, deleteHomeroom } from '../actions'
import type { ActionResult } from '@/types/bff-types'

export const defaultHomeroomDays: HomeroomDay[] = [
  { id: 'mon', dayOfWeek: 'mon', periods: 0 },
  { id: 'tue', dayOfWeek: 'tue', periods: 0 },
  { id: 'wed', dayOfWeek: 'wed', periods: 0 },
  { id: 'thu', dayOfWeek: 'thu', periods: 0 },
  { id: 'fri', dayOfWeek: 'fri', periods: 0 },
]

export interface HomeroomFormValues {
  id: string
  homeroomName: string
  homeroomDays: HomeroomDay[]
  gradeId: string
}

interface UseHomeroomModalArgs {
  initialValues: HomeroomFormValues
}

export function useHomeroomModal({ initialValues }: UseHomeroomModalArgs) {
  const [error, setError] = useState<string | null>(null)

  const prevIdRef = useRef<string>(initialValues.id)

  useEffect(() => {
    if (prevIdRef.current !== initialValues.id) {
      setError(null)
      prevIdRef.current = initialValues.id
    }
  }, [initialValues.id])

  const [saveResult, saveAction, savePending] = useActionState(
    createHomeroom,
    null as ActionResult | null
  )
  const [deleteResult, deleteAction, deletePending] = useActionState(
    deleteHomeroom,
    null as ActionResult | null
  )

  // 保存結果を監視してエラーを表示
  useEffect(() => {
    if (saveResult?.success === false) {
      setError(saveResult.error || '学級の保存に失敗しました')
    }
  }, [saveResult])

  useEffect(() => {
    if (deleteResult?.success === false) {
      setError(deleteResult.error || '学級の削除に失敗しました')
    }
  }, [deleteResult])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    clearError,
    saveAction,
    savePending,
    saveResult,
    deleteAction,
    deletePending,
    deleteResult,
  }
}
