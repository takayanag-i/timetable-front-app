'use client'
import styles from './CourseEntry.module.css'
import type { OnEditCourseData } from '@/app/(private)/curriculum/components/HomeroomEntry/types'

interface CourseEntryProps {
  courseId: string
  courseName: string
  instructorNames: string
  room: string
  subjectId?: string
  instructorIds: string[]
  laneId: string
  gradeId: string | null
  onEdit?: (data: OnEditCourseData) => void
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
    onEdit({
      courseId,
      courseName,
      subjectId: subjectId || null,
      instructorIds,
      laneId,
      gradeId,
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
