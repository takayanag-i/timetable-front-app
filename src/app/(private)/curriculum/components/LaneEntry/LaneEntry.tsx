'use client'
import styles from './LaneEntry.module.css'
import CourseEntry from '@/app/(private)/curriculum/components/CourseEntry/CourseEntry'
import type { Course } from '@/app/(private)/curriculum/types'
import type {
  OnAddCourseData,
  OnEditCourseData,
} from '@/app/(private)/curriculum/components/HomeroomEntry/types'

/**
 * LaneEntry コンポーネントのProps
 */
interface LaneEntryProps {
  id: string
  blockId: string
  gradeId: string | null
  courses?: Course[]
  onAddCourse?: (data: OnAddCourseData) => void
  onEditCourse?: (data: OnEditCourseData) => void
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
    onAddCourse({
      laneId: id,
      blockId,
      gradeId,
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
