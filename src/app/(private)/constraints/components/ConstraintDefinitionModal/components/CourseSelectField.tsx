'use client'

import { useState, useEffect, useMemo } from 'react'
import { Subject, Course } from '@/core/domain/entity'
import { fetchCourseOptions } from '../actions'
import styles from '../ConstraintDefinitionModal.module.css'

interface CourseSelectFieldProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

/**
 * 講座選択フィールド
 * 学年 -> 科目 -> 講座 の順で絞り込みが可能
 */
export function CourseSelectField({
  value,
  onChange,
  disabled = false,
}: CourseSelectFieldProps) {
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  // 選択状態
  const [selectedGradeId, setSelectedGradeId] = useState<string>('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')

  // データ取得
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const result = await fetchCourseOptions()
      if (result.success && result.data) {
        setSubjects(result.data.subjects)
        setCourses(result.data.courses)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  // 初期値がある場合、学年と科目を自動設定
  useEffect(() => {
    if (value && courses.length > 0 && !selectedGradeId && !selectedSubjectId) {
      const course = courses.find(c => c.id === value)
      if (course) {
        if (course.subject) {
          setSelectedSubjectId(course.subject.id)
          if (course.subject.grade) {
            setSelectedGradeId(course.subject.grade.id)
          }
        }
      }
    }
  }, [value, courses, selectedGradeId, selectedSubjectId])

  // 学年リストの生成（科目から抽出）
  const grades = useMemo(() => {
    const uniqueGrades = new Map()
    subjects.forEach(subject => {
      if (subject.grade) {
        uniqueGrades.set(subject.grade.id, subject.grade)
      }
    })
    return Array.from(uniqueGrades.values()).sort((a, b) =>
      a.gradeName.localeCompare(b.gradeName)
    )
  }, [subjects])

  // 学年による科目の絞り込み
  const filteredSubjects = useMemo(() => {
    if (!selectedGradeId) return subjects
    return subjects.filter(s => s.grade?.id === selectedGradeId)
  }, [subjects, selectedGradeId])

  // 科目による講座の絞り込み
  const filteredCourses = useMemo(() => {
    if (selectedSubjectId) {
      return courses.filter(c => c.subject?.id === selectedSubjectId)
    }
    if (selectedGradeId) {
      return courses.filter(c => c.subject?.grade?.id === selectedGradeId)
    }
    return courses
  }, [courses, selectedSubjectId, selectedGradeId])

  return (
    <div className={styles.nestedGroup}>
      {/* 学年選択 */}
      <div className={styles.parameterField}>
        <label className={styles.parameterLabel}>学年フィルタ</label>
        <select
          className={styles.select}
          value={selectedGradeId}
          onChange={e => {
            setSelectedGradeId(e.target.value)
            setSelectedSubjectId('')
          }}
          disabled={disabled || loading}
        >
          <option value="">すべての学年</option>
          {grades.map(grade => (
            <option key={grade.id} value={grade.id}>
              {grade.gradeName}
            </option>
          ))}
        </select>
      </div>

      {/* 科目選択 */}
      <div className={styles.parameterField}>
        <label className={styles.parameterLabel}>科目フィルタ</label>
        <select
          className={styles.select}
          value={selectedSubjectId}
          onChange={e => {
            setSelectedSubjectId(e.target.value)
          }}
          disabled={disabled || loading}
        >
          <option value="">すべての科目</option>
          {filteredSubjects.map(subject => (
            <option key={subject.id} value={subject.id}>
              {subject.subjectName}
            </option>
          ))}
        </select>
      </div>

      {/* 講座選択（これが実際の値） */}
      <div className={styles.parameterField}>
        <label className={styles.parameterLabel}>講座</label>
        <select
          className={styles.select}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled || loading}
        >
          <option value="">講座を選択してください</option>
          {filteredCourses.map(course => (
            <option key={course.id} value={course.id}>
              {course.courseName}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
