'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import HomeroomEntry from '@/app/(private)/curriculum/components/HomeroomEntry/HomeroomEntry'
import HomeroomModal from '@/app/(private)/curriculum/components/HomeroomModal/HomeroomModal'
import { CourseModal } from '@/app/(private)/curriculum/components/CourseModal/CourseModal'
import BlockModal from '@/app/(private)/curriculum/components/BlockModal/BlockModal'
import { fetchSchoolDays } from './actions/actions'
import { fetchHomeroom } from '@/app/(private)/curriculum/components/HomeroomModal/actions'
import { fetchCourseModalOptions } from '@/app/(private)/curriculum/components/CourseModal/actions'
import { useCurriculumUi } from './hooks/useCurriculumUi'
import {
  Grade,
  Homeroom as HomeroomEntity,
  SchoolDay,
} from '@/core/domain/entity'
import { CourseModalOptions } from '@/types/ui-types'
import { ActionResult } from '@/types/bff-types'
import type { CourseFormValues } from '@/types/ui-types'
import styles from './CurriculumUi.module.css'

interface Props {
  homerooms: HomeroomEntity[]
  grades: Grade[]
}

/**
 * カリキュラム設定画面
 */
export default function CurriculumUi({ homerooms, grades }: Props) {
  // モーダルの状態と操作関数を取得
  const {
    isOpen,
    homeroomModalData,
    openCreateModalWithSchoolDays,
    openEditModal,
    closeModal,
  } = useCurriculumUi()

  // 学級取得Server Action
  const [fetchedHomeroomResult, fetchHomeroomAction] = useActionState(
    fetchHomeroom,
    null as ActionResult<HomeroomEntity> | null
  )
  // 学校曜日取得Server Action
  const [fetchedSchoolDaysResult, fetchSchoolDaysAction, isPending] =
    useActionState(fetchSchoolDays, null as ActionResult<SchoolDay[]> | null)

  // 講座フォームデータ取得Server Action
  const [fetchedCourseModalOptionsResult, fetchCourseModalOptionsAction] =
    useActionState(
      fetchCourseModalOptions,
      null as ActionResult<CourseModalOptions> | null
    )

  // ブロックモーダルの状態管理
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  type BlockModalContext =
    | {
        mode: 'create'
        homeroomId: string | null
      }
    | {
        mode: 'edit'
        homeroomId: string
        blockId: string
        blockName: string
        laneCount: number
      }

  const [blockModalContext, setBlockModalContext] =
    useState<BlockModalContext | null>(null)

  // 講座モーダルの状態管理
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [currentLaneId, setCurrentLaneId] = useState<string | null>(null)
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null)
  const [currentGradeId, setCurrentGradeId] = useState<string | null>(null)
  // 編集モード用の状態
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [editingCourseName, setEditingCourseName] = useState<string>('')
  const [editingSubjectId, setEditingSubjectId] = useState<string>('')
  const [editingInstructorIds, setEditingInstructorIds] = useState<string[]>([])
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null)

  const courseModalInitialValues = useMemo<CourseFormValues>(() => {
    const normalizedInstructorIds = Array.from(
      new Set(
        (isEditMode ? editingInstructorIds : []).filter((id): id is string =>
          Boolean(id)
        )
      )
    )

    const courseDetails =
      normalizedInstructorIds.length > 0
        ? normalizedInstructorIds.map(id => ({ instructorId: id }))
        : [{ instructorId: '' }]

    return {
      subjectId: isEditMode ? editingSubjectId || '' : '',
      courseName: isEditMode ? editingCourseName || '' : '',
      courseDetails,
    }
  }, [isEditMode, editingCourseName, editingSubjectId, editingInstructorIds])

  useEffect(() => {
    if (!selectedGradeId) {
      return
    }

    if (!grades.some(grade => grade.id === selectedGradeId)) {
      setSelectedGradeId(null)
    }
  }, [grades, selectedGradeId])

  const filteredHomerooms = useMemo(() => {
    if (selectedGradeId === null) {
      return homerooms
    }

    return homerooms.filter(
      homeroom => homeroom.grade?.id && homeroom.grade.id === selectedGradeId
    )
  }, [homerooms, selectedGradeId])

  // 学級データ取得が成功したらモーダルを開く
  useEffect(() => {
    if (fetchedHomeroomResult?.success) {
      const data = fetchedHomeroomResult.data
      openEditModal({
        id: data.id,
        homeroomName: data.homeroomName,
        homeroomDays: data.homeroomDays,
        gradeId: data.grade?.id ?? null,
      })
    } else if (fetchedHomeroomResult?.success === false) {
      alert(`エラー: ${fetchedHomeroomResult.error}`)
    }
  }, [fetchedHomeroomResult, openEditModal])

  // 学校曜日データ取得が成功したら新規作成モーダルを開く
  useEffect(() => {
    if (fetchedSchoolDaysResult?.success) {
      openCreateModalWithSchoolDays(
        fetchedSchoolDaysResult.data,
        selectedGradeId
      )
    } else if (fetchedSchoolDaysResult?.success === false) {
      alert(`エラー: ${fetchedSchoolDaysResult.error}`)
    }
  }, [fetchedSchoolDaysResult, openCreateModalWithSchoolDays, selectedGradeId])

  // 講座フォームデータ取得が成功したら講座モーダルを開く
  useEffect(() => {
    if (fetchedCourseModalOptionsResult?.success) {
      setIsCourseModalOpen(true)
    } else if (fetchedCourseModalOptionsResult?.success === false) {
      alert(`エラー: ${fetchedCourseModalOptionsResult.error}`)
    }
  }, [fetchedCourseModalOptionsResult])

  // 講座編集ハンドラー（FormDataベース）
  const handleEditCourse = (formData: FormData) => {
    const courseId = formData.get('courseId') as string
    const courseName = formData.get('courseName') as string
    const subjectId = formData.get('subjectId') as string | null
    const instructorIds = formData
      .getAll('instructorIds')
      .map(value => (typeof value === 'string' ? value : ''))
      .filter((value): value is string => value.length > 0)
    const laneId = formData.get('laneId') as string
    const gradeId = formData.get('gradeId') as string | null

    console.log('DEBUG handleEditCourse called with:', {
      courseId,
      courseName,
      subjectId,
      laneId,
    })

    setIsEditMode(true)
    setEditingCourseId(courseId)
    setEditingCourseName(courseName)
    setEditingSubjectId(subjectId || '')
    setEditingInstructorIds(instructorIds.length ? instructorIds : [])
    setCurrentLaneId(laneId)
    setCurrentGradeId(gradeId || null)
    fetchCourseModalOptionsAction()
  }

  // モーダル成功時のハンドラー
  const handleCourseModalSuccess = () => {
    setIsCourseModalOpen(false)
    setCurrentLaneId(null)
    setCurrentBlockId(null)
    setCurrentGradeId(null)
    setIsEditMode(false)
    setEditingCourseId(null)
    setEditingCourseName('')
    setEditingSubjectId('')
    setEditingInstructorIds([])
  }

  // モーダルクローズ時のハンドラー
  const handleCourseModalClose = () => {
    setIsCourseModalOpen(false)
    setCurrentLaneId(null)
    setCurrentBlockId(null)
    setCurrentGradeId(null)
    setIsEditMode(false)
    setEditingCourseId(null)
    setEditingCourseName('')
    setEditingSubjectId('')
    setEditingInstructorIds([])
  }

  // ブロックモーダル成功時のハンドラー
  const handleBlockModalSuccess = () => {
    setIsBlockModalOpen(false)
    setBlockModalContext(null)
  }

  const handleBlockModalDeleteSuccess = () => {
    setIsBlockModalOpen(false)
    setBlockModalContext(null)
  }

  // ブロックモーダルクローズ時のハンドラー
  const handleBlockModalClose = () => {
    setIsBlockModalOpen(false)
    setBlockModalContext(null)
  }

  return (
    <>
      <h1>カリキュラム設定</h1>

      <div className={styles.gradeSwitcher}>
        {grades.length === 0 ? (
          <span className={styles.gradeSwitcherMessage}>
            学年が登録されていません
          </span>
        ) : (
          <>
            <button
              type="button"
              className={`${styles.gradeButton} ${
                selectedGradeId === null ? styles.gradeButtonActive : ''
              }`}
              onClick={() => setSelectedGradeId(null)}
              aria-pressed={selectedGradeId === null}
            >
              すべて
            </button>
            {grades.map(grade => (
              <button
                key={grade.id}
                type="button"
                className={`${styles.gradeButton} ${
                  selectedGradeId === grade.id ? styles.gradeButtonActive : ''
                }`}
                onClick={() => setSelectedGradeId(grade.id)}
                aria-pressed={selectedGradeId === grade.id}
              >
                {grade.gradeName}
              </button>
            ))}
          </>
        )}
      </div>

      <div className={styles.homeroomContainer}>
        {filteredHomerooms.length === 0 ? (
          <p>
            {selectedGradeId
              ? 'この学年の学級はまだ登録されていません。'
              : '学級を追加しましょう！'}
          </p>
        ) : (
          filteredHomerooms.map(homeroom => (
            <HomeroomEntry
              key={homeroom.id}
              blocks={homeroom.blocks}
              homeroomId={homeroom.id}
              homeroomName={homeroom.homeroomName}
              gradeId={homeroom.grade?.id ?? null}
              onEdit={fetchHomeroomAction}
              onAddCourse={(formData: FormData) => {
                const laneId = formData.get('laneId') as string
                const blockId = formData.get('blockId') as string
                const gradeId = formData.get('gradeId') as string | null
                console.log('DEBUG CurriculumUi - onAddCourse called with:', {
                  laneId,
                  blockId,
                })
                setIsEditMode(false)
                setCurrentLaneId(laneId)
                setCurrentBlockId(blockId)
                setCurrentGradeId(gradeId || null)
                fetchCourseModalOptionsAction()
              }}
              onEditCourse={handleEditCourse}
              onAddBlock={(formData: FormData) => {
                const homeroomId = formData.get('homeroomId') as string
                setBlockModalContext({
                  mode: 'create',
                  homeroomId,
                })
                setIsBlockModalOpen(true)
              }}
              onEditBlock={block => {
                setBlockModalContext({
                  mode: 'edit',
                  homeroomId: block.homeroomId,
                  blockId: block.blockId,
                  blockName: block.blockName,
                  laneCount: block.laneCount,
                })
                setIsBlockModalOpen(true)
              }}
            />
          ))
        )}
        <form action={fetchSchoolDaysAction}>
          <button
            type="submit"
            disabled={isPending}
            className={styles.addHomeroomButton}
          >
            {isPending ? '読み込み中...' : '学級を追加する'}
          </button>
        </form>
      </div>

      <HomeroomModal
        key={homeroomModalData?.id || 'new'}
        isOpen={isOpen}
        title={
          homeroomModalData?.id
            ? `${homeroomModalData.homeroomName}を編集`
            : '学級を追加しましょう！'
        }
        homeroomModalData={homeroomModalData}
        grades={grades}
        onSuccess={closeModal}
        onClose={closeModal}
      />

      {/* 講座モーダル */}
      <CourseModal
        isOpen={isCourseModalOpen}
        courseModalOptions={
          fetchedCourseModalOptionsResult?.success
            ? fetchedCourseModalOptionsResult.data
            : null
        }
        laneId={currentLaneId || undefined}
        blockId={currentBlockId || undefined}
        editMode={isEditMode}
        courseId={editingCourseId || undefined}
        initialValues={courseModalInitialValues}
        gradeId={currentGradeId || undefined}
        onSuccess={handleCourseModalSuccess}
        onClose={handleCourseModalClose}
      />

      {/* ブロックモーダル */}
      <BlockModal
        isOpen={isBlockModalOpen}
        mode={blockModalContext?.mode ?? 'create'}
        title={
          blockModalContext?.mode === 'edit'
            ? `${blockModalContext.blockName}を編集`
            : 'ブロックを追加'
        }
        homeroomId={blockModalContext?.homeroomId ?? null}
        blockId={
          blockModalContext?.mode === 'edit' ? blockModalContext.blockId : null
        }
        initialBlockName={
          blockModalContext?.mode === 'edit'
            ? blockModalContext.blockName
            : undefined
        }
        initialLaneCount={
          blockModalContext?.mode === 'edit'
            ? blockModalContext.laneCount
            : undefined
        }
        onSuccess={handleBlockModalSuccess}
        onDeleteSuccess={handleBlockModalDeleteSuccess}
        onClose={handleBlockModalClose}
      />
    </>
  )
}
