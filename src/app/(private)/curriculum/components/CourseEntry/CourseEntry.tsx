import styles from './CourseEntry.module.css'

/**
 * CourseEntry コンポーネントのProps
 */
interface CourseEntryProps {
  courseId: string
  courseName: string
  instructorNames: string
  room: string
  subjectId?: string
  instructorIds?: string[]
  laneId?: string
  gradeId?: string | null
  /** Server Actionを受け取る */
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
  return (
    <form action={onEdit} className={styles.courseForm}>
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="courseName" value={courseName} />
      {subjectId && <input type="hidden" name="subjectId" value={subjectId} />}
      {instructorIds?.length
        ? instructorIds.map(id => (
            <input key={id} type="hidden" name="instructorIds" value={id} />
          ))
        : null}
      {laneId && <input type="hidden" name="laneId" value={laneId} />}
      <input type="hidden" name="gradeId" value={gradeId || ''} />
      <button
        type="submit"
        className={`${styles.courseEntry} ${
          onEdit ? styles.courseEntryClickable : styles.courseEntryDefault
        }`}
      >
        <div title={courseName}>{truncateText(courseName, 8)}</div>
        <div title={instructorNames}>{truncateText(instructorNames, 6)}</div>
        <div title={room}>{truncateText(room, 6)}</div>
      </button>
    </form>
  )
}
