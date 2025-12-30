import type { Instructor } from '@/app/(private)/curriculum/types'
import styles from '../CourseModal.module.css'

interface InstructorSelectFieldProps {
  selectId?: string
  label?: string
  value: string
  onChange: (instructorId: string) => void
  instructors: Instructor[]
  disabled: boolean
  showNoInstructorsHelper: boolean
}

export function InstructorSelectField({
  selectId = 'instructor',
  label = '担当教員 *',
  value,
  onChange,
  instructors,
  disabled,
  showNoInstructorsHelper,
}: InstructorSelectFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={event => onChange(event.target.value)}
        className={styles.select}
        required
        disabled={disabled}
      >
        <option value="">教員を選択してください</option>
        {instructors.map(instructor => (
          <option key={instructor.id} value={instructor.id}>
            {instructor.instructorName}
          </option>
        ))}
      </select>
      {showNoInstructorsHelper && (
        <p className={styles.helperText}>
          選択した科目の教科に紐づく教員が登録されていません。
        </p>
      )}
    </div>
  )
}
