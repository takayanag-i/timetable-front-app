'use client'
import { startTransition } from 'react'
import styles from './LaneEntry.module.css'
import CourseEntry from '@/app/(private)/curriculum/components/CourseEntry/CourseEntry'
import type { Course } from '@/app/(private)/curriculum/types'

/**
 * LaneEntry コンポーネントのProps
 */
interface LaneEntryProps {
  id: string
  blockId: string
  gradeId: string | null
  courses?: Course[]
  /** Server Actionを受け取る */
  onAddCourse?: (formData: FormData) => void
  /** Server Actionを受け取る */
  onEditCourse?: (formData: FormData) => void
}

export default function LaneEntry({
  id,
  blockId,
  gradeId,
  courses = [],
  onAddCourse,
  onEditCourse,
}: LaneEntryProps) {
  const handleAddCourse = () => {
    if (!onAddCourse) return

    const formData = new FormData()
    formData.append('laneId', id)
    formData.append('blockId', blockId)
    formData.append('gradeId', gradeId || '')
    startTransition(() => {
      onAddCourse(formData)
    })
  }

  return (
    <div className={styles.lane}>
      <div className={styles.courseContainer}>
        {courses.map(course => (
          <CourseEntry
            key={course.id}
            courseId={course.id}
            courseName={course.courseName}
            instructorNames={course.courseDetails
              ?.map(detail => detail.instructor.instructorName)
              .join(' / ')}
            room={course.courseDetails
              ?.map(detail => detail.room?.roomName || '*')
              .join(' / ')}
            subjectId={course.subject?.id}
            instructorIds={course.courseDetails
              ?.map(detail => detail.instructor.id)
              .filter((id): id is string => Boolean(id))}
            laneId={id}
            gradeId={gradeId}
            onEdit={onEditCourse}
          />
        ))}

        <button
          type="button"
          onClick={handleAddCourse}
          className={styles.addCourseButton}
          aria-label="講座を追加"
          disabled={!onAddCourse}
        >
          +
        </button>
      </div>
    </div>
  )
}
