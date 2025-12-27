import styles from './LaneEntry.module.css'
import CourseEntry from '@/app/(private)/curriculum/components/CourseEntry/CourseEntry'
import { Course as CourseEntity } from '@/core/domain/entity'

/**
 * LaneEntry コンポーネントのProps
 */
interface LaneEntryProps {
  id: string
  blockId: string
  gradeId: string | null
  courses?: CourseEntity[]
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

        {/* フォームのaction属性でServer Actionを使用 */}
        <form action={onAddCourse}>
          <input type="hidden" name="laneId" value={id} />
          <input type="hidden" name="blockId" value={blockId} />
          <input type="hidden" name="gradeId" value={gradeId || ''} />
          <button
            type="submit"
            className={styles.addCourseButton}
            aria-label="講座を追加"
          >
            +
          </button>
        </form>
      </div>
    </div>
  )
}
