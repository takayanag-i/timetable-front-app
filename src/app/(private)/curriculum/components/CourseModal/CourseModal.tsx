'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/shared/Modal'
import styles from './CourseModal.module.css'
import type { CourseModalOptions, CourseFormValues } from './types'
import { CourseCurrent } from './components/CourseCurrent'
import { CourseAddOrChange } from './components/CourseAddOrChange'
import { createAppError, ErrorCode } from '@/lib/errors'

interface CourseModalProps {
  isOpen: boolean
  editMode: boolean
  laneId: string
  courseId?: string
  gradeId?: string
  initialValues: CourseFormValues
  courseModalOptions: CourseModalOptions
  onClose: () => void
  onSuccess: () => void
}

/**
 * 講座モーダル
 */
export function CourseModal({
  isOpen,
  editMode,
  laneId,
  courseId,
  gradeId,
  initialValues,
  courseModalOptions,
  onClose,
  onSuccess,
}: CourseModalProps) {
  // 編集モードの必須ID欠損
  if (editMode && (!courseId || !laneId)) {
    throw createAppError(
      new Error('編集モードの必須IDが不足しています'),
      ErrorCode.DATA_VALIDATION_ERROR
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
        initialValues={initialValues}
        gradeId={gradeId}
      />
    </Modal>
  )
}
