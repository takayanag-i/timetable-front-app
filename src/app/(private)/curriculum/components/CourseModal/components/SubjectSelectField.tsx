import styles from '../CourseModal.module.css'
import type { CourseModalOptions } from '@/types/ui-types'

interface SubjectSelectFieldProps {
  subjects: CourseModalOptions['subjects']
  value: string
  onChange: (subjectId: string) => void
}

export function SubjectSelectField({
  subjects,
  value,
  onChange,
}: SubjectSelectFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor="subject" className={styles.label}>
        科目 *
      </label>
      <select
        id="subject"
        value={value}
        onChange={event => onChange(event.target.value)}
        className={styles.select}
        required
      >
        <option value="">科目を選択してください</option>
        {subjects.map(subject => (
          <option key={subject.id} value={subject.id}>
            {subject.subjectName}
          </option>
        ))}
      </select>
    </div>
  )
}
