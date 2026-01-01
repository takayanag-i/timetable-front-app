import { useMemo } from 'react'
import type { CourseModalInstructor, CourseModalSubject } from '../types'
import styles from '../CourseModal.module.css'

interface InstructorSelectFieldProps {
  selectId: string
  label: string
  value: string
  subjectId: string | undefined
  subjects: CourseModalSubject[]
  instructors: CourseModalInstructor[]
  selectedInstructorIds: string[]
  onChange: (instructorId: string) => void
}

export function InstructorSelectField({
  selectId,
  label,
  value,
  subjectId,
  subjects,
  instructors,
  selectedInstructorIds,
  onChange,
}: InstructorSelectFieldProps) {
  // 科目に紐づく教員を取得
  const availableInstructors = useMemo(() => {
    // subjectIdで科目を取得
    const selectedSubject = subjectId
      ? subjects.find(subject => subject.id === subjectId) || null
      : null

    if (!selectedSubject) {
      // 科目が選択されていない場合は、全教員を返却
      return instructors
    }

    // 教科コードを取得
    const disciplineCode = selectedSubject.discipline?.disciplineCode ?? null

    if (!disciplineCode) {
      // 科目に教科が紐づいていない場合は、全教員を返却
      return instructors
    }

    // 教科コードでフィルタ
    return instructors.filter(
      instructor => instructor.disciplineCode === disciplineCode
    )
  }, [instructors, subjectId, subjects])

  // 選択済み教員を除外した教員リスト
  const filteredInstructors = useMemo(() => {
    return availableInstructors.filter(
      instructor =>
        instructor.id === value ||
        !selectedInstructorIds.includes(instructor.id)
    )
  }, [availableInstructors, value, selectedInstructorIds])

  const disabled = availableInstructors.length === 0

  return (
    <div className={styles.field}>
      {/* 動的なidとラベル */}
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
        {filteredInstructors.map(instructor => (
          <option key={instructor.id} value={instructor.id}>
            {instructor.instructorName}
          </option>
        ))}
      </select>
      {disabled && (
        <p className={styles.helperText}>
          選択した科目の教科に紐づく教員が登録されていません。
        </p>
      )}
    </div>
  )
}
