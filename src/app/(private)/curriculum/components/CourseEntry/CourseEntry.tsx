'use client'
import { startTransition } from 'react'
import styles from './CourseEntry.module.css'

interface CourseEntryProps {
  courseId: string
  courseName: string
  instructorNames: string
  room: string
  subjectId?: string
  instructorIds: string[]
  laneId: string
  gradeId: string | null
  onEdit?: (formData: FormData) => void
}

// 文字数制限ユーティリティ関数
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export default function CourseEntry({
  courseId,
  courseName,
  instructorNames,
  room,
  subjectId,
  instructorIds,
  laneId,
  gradeId,
  onEdit,
}: CourseEntryProps) {
  const handleClick = () => {
    if (!onEdit) return

    const formData = new FormData()
    formData.append('courseId', courseId)
    formData.append('courseName', courseName)
    if (subjectId) {
      formData.append('subjectId', subjectId)
    }
    instructorIds.forEach(id => {
      formData.append('instructorIds', id)
    })
    formData.append('laneId', laneId)
    formData.append('gradeId', gradeId || '')
    startTransition(() => {
      onEdit(formData)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.courseEntry} ${
        onEdit ? styles.courseEntryClickable : styles.courseEntryDefault
      }`}
      disabled={!onEdit}
    >
      <div title={courseName}>{truncateText(courseName, 8)}</div>
      <div title={instructorNames}>{truncateText(instructorNames, 6)}</div>
      <div title={room}>{truncateText(room, 6)}</div>
    </button>
  )
}
