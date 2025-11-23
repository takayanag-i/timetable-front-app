import {
  useState,
  useEffect,
  useActionState,
  useCallback,
  useMemo,
} from 'react'
import type { HomeroomDay } from '@/core/domain/entity'
import type { HomeroomModalData } from '@/types/ui-types'
import { createHomeroom, deleteHomeroom } from '../actions'
import type { ActionResult } from '@/types/bff-types'

const defaultHomeroomDays: HomeroomDay[] = [
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

export function useHomeroomModal(homeroomModalData: HomeroomModalData | null) {
  const [error, setError] = useState<string | null>(null)

  const initialValues = useMemo<HomeroomFormValues>(
    () => ({
      id: homeroomModalData?.id ?? '',
      homeroomName: homeroomModalData?.homeroomName ?? '',
      homeroomDays:
        homeroomModalData?.homeroomDays && homeroomModalData.homeroomDays.length
          ? homeroomModalData.homeroomDays
          : defaultHomeroomDays,
      gradeId: homeroomModalData?.gradeId ?? '',
    }),
    [homeroomModalData]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const [saveResult, saveAction, savePending] = useActionState(
    createHomeroom,
    null as ActionResult | null
  )
  const [deleteResult, deleteAction, deletePending] = useActionState(
    deleteHomeroom,
    null as ActionResult | null
  )

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

  return {
    initialValues,
    error,
    clearError,
    saveAction,
    savePending,
    deleteAction,
    deletePending,
  }
}
