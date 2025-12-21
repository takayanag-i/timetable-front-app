import { useState, useCallback } from 'react'
import { useModal } from '@/components/shared/Modal'
import type { HomeroomModalData } from '@/app/(private)/curriculum/components/HomeroomModal/types'
import { SchoolDay } from '@/core/domain/entity'

/**
 * カリキュラム設定画面のホームルームモーダル状態を管理するカスタムフック
 *
 * @returns モーダルの状態と操作関数
 */
export function useCurriculumUi() {
  // 共通モーダルコンポーネントの状態と操作関数を取得
  const { isOpen, open, close } = useModal()

  // 学級モーダル用の学級データ
  const [homeroomModalData, setHomeroomModalData] =
    useState<HomeroomModalData | null>(null)

  /**
   * 学校曜日データを使って学級作成モーダルを開く
   */
  const openCreateModalWithSchoolDays = useCallback(
    (schoolDays: SchoolDay[], defaultGradeId: string | null = null) => {
      // 利用可能な学校曜日のみを抽出してHomeroomDay配列を生成
      const homeroomDays = schoolDays
        .filter(day => day.isAvailable)
        .map(day => ({
          id: '',
          dayOfWeek: day.dayOfWeek,
          periods: day.amPeriods + day.pmPeriods,
        }))

      setHomeroomModalData({
        id: null,
        homeroomName: '',
        homeroomDays: homeroomDays,
        gradeId: defaultGradeId,
      })
      open()
    },
    [open]
  )

  /**
   * 学級編集モーダルを開く
   */
  const openEditModal = useCallback(
    (data: HomeroomModalData) => {
      setHomeroomModalData(data)
      open()
    },
    [open]
  )

  /**
   * モーダルを閉じる
   */
  const closeModal = useCallback(() => {
    setHomeroomModalData(null)
    close()
  }, [close])

  return {
    // 状態
    isOpen,
    homeroomModalData,
    // 操作関数
    openCreateModalWithSchoolDays,
    openEditModal,
    closeModal,
  }
}
