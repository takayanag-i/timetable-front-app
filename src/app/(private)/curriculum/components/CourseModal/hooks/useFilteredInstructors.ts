import { useMemo } from 'react'
import type { Subject, Instructor } from '@/core/domain/entity'

interface UseFilteredInstructorsParams {
  subjectId: string
  subjects: Subject[]
  instructors: Instructor[]
}

export function useFilteredInstructors({
  subjectId,
  subjects,
  instructors,
}: UseFilteredInstructorsParams) {
  // 選択中の科目と同じ教科の教員のリスト
  const availableInstructors = useMemo(() => {
    // subjectIdで科目を取得
    const selectedSubject = subjectId
      ? subjects.find(subject => subject.id === subjectId) || null
      : null
    // 教科コードを取得
    const disciplineCode = selectedSubject?.discipline?.disciplineCode || null

    if (!disciplineCode) {
      // 科目または分野が取得できなければ、全教員を返却
      return instructors
    }

    return instructors.filter(
      // 教科コードでフィルタ
      instructor => instructor.disciplineCode === disciplineCode
    )
  }, [instructors, subjectId, subjects])

  return {
    availableInstructors,
  }
}
