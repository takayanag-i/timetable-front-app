'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/shared/Modal'
import styles from './CourseModal.module.css'
import type { CourseModalOptions, CourseFormValues } from './types'
import { CourseCurrent } from './components/CourseCurrent'
import { CourseAddOrChange } from './components/CourseAddOrChange'

/**
 * CourseModal コンポーネントのProps
 */
interface CourseModalProps {
  /** モーダル表示フラグ */
  isOpen: boolean
  /** モーダルを閉じる際のコールバック */
  onClose: () => void
  /** 成功時コールバック */
  onSuccess?: () => void
  /** 科目/教員/既存講座オプション */
  courseModalOptions: CourseModalOptions | null
  /** 操作対象レーンID */
  laneId?: string
  /** 操作対象ブロックID */
  blockId?: string
  /** 編集モード（true なら既存講座編集） */
  editMode?: boolean
  /** 編集対象の講座ID */
  courseId?: string
  /** フォーム初期値 */
  initialValues: CourseFormValues
  /** 絞り込み対象の学年ID */
  gradeId?: string
}

/**
 * 講座モーダル（新規作成・講座変更・現在の講座編集の切り替え）
 */
export function CourseModal({
  isOpen,
  onClose,
  onSuccess,
  courseModalOptions,
  laneId,
  blockId,
  editMode = false,
  courseId,
  initialValues,
  gradeId,
}: CourseModalProps) {
  // 編集モードの必須ID欠損
  if (editMode && (!courseId || !laneId)) {
    throw new Error(
      'CourseModal: 編集モードの必須IDが不足しています（courseId または laneId）'
    )
  }

  // 編集モードの場合の選択: 'current' = 現在の講座を編集, 'change' = 講座を変更
  const [editType, setEditType] = useState<'current' | 'change'>('current')

  // モーダルが開いたときに初期値をリセット
  useEffect(() => {
    if (isOpen && editMode) {
      setEditType('current')
    }
  }, [isOpen, editMode])

  // 閉じる際は状態を初期化
  const handleClose = () => {
    onClose()
  }

  // 編集モードの場合、まず選択肢を表示
  if (editMode) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className={styles.header}>
          <h2 className={styles.title}>講座を編集</h2>
        </div>

        <div className={styles.sectionSwitch}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="editType"
              value="current"
              checked={editType === 'current'}
              onChange={() => setEditType('current')}
            />
            <span>現在の講座を編集</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="editType"
              value="change"
              checked={editType === 'change'}
              onChange={() => setEditType('change')}
            />
            <span>講座を変更</span>
          </label>
        </div>

        {editType === 'current' ? (
          <CourseCurrent
            isOpen={isOpen}
            onClose={handleClose}
            onSuccess={onSuccess}
            courseModalOptions={courseModalOptions}
            laneId={laneId!}
            courseId={courseId!}
            initialValues={initialValues}
          />
        ) : (
          <CourseAddOrChange
            isOpen={isOpen}
            onClose={handleClose}
            onSuccess={onSuccess}
            courseModalOptions={courseModalOptions}
            laneId={laneId}
            blockId={blockId}
            initialValues={{
              ...initialValues,
              courseName: '',
            }}
            gradeId={gradeId}
          />
        )}
      </Modal>
    )
  }

  // 新規作成モードの場合は登録モーダルを直接表示
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className={styles.header}>
        <h2 className={styles.title}>講座を追加</h2>
      </div>
      <CourseAddOrChange
        isOpen={isOpen}
        onClose={handleClose}
        onSuccess={onSuccess}
        courseModalOptions={courseModalOptions}
        laneId={laneId}
        blockId={blockId}
        initialValues={initialValues}
        gradeId={gradeId}
      />
    </Modal>
  )
}
