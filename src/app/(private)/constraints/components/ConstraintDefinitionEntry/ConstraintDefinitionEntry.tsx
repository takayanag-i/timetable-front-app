import { ConstraintDefinition, Course } from '@/core/domain/entity'
import type { ConstraintDefinitionMasterResponse } from '@/app/(private)/constraints/graphql/types'
import styles from './ConstraintDefinitionEntry.module.css'

/**
 * ConstraintDefinitionEntry コンポーネントのProps
 */
interface ConstraintDefinitionEntryProps {
  constraintDefinition: ConstraintDefinition
  /** 制約定義マスター（名前・説明を取得するため） */
  master?: ConstraintDefinitionMasterResponse | null
  /** 講座一覧（講座名を解決するため） */
  courses?: Course[]
  /** Server Actionを受け取る */
  onEdit?: (formData: FormData) => void
}

/**
 * 制約定義エントリコンポーネント
 */
export default function ConstraintDefinitionEntry({
  constraintDefinition,
  master,
  courses = [],
  onEdit,
}: ConstraintDefinitionEntryProps) {
  /**
   * 講座IDから講座名を取得
   */
  const getCourseName = (courseId: string): string => {
    const course = courses.find(c => c.id === courseId)
    return course?.courseName || courseId
  }

  /**
   * パラメータから表示用テキストを生成
   */
  const getParameterDisplay = (): string | null => {
    if (!constraintDefinition.parameters) return null
    try {
      const params =
        typeof constraintDefinition.parameters === 'string'
          ? JSON.parse(constraintDefinition.parameters)
          : constraintDefinition.parameters
      // courseIdがある場合は講座名を表示
      if (params.courseId) {
        const courseName = getCourseName(params.courseId)
        return courseName
      }
      // その他のパラメータがある場合
      const keys = Object.keys(params)
      if (keys.length > 0) {
        return keys.map(key => `${key}: ${params[key]}`).join(', ')
      }
      return null
    } catch {
      return null
    }
  }

  const parameterDisplay = getParameterDisplay()

  return (
    <div className={styles.entry}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span
            className={`${styles.flag} ${
              constraintDefinition.softFlag ? styles.soft : styles.hard
            }`}
          >
            {constraintDefinition.softFlag ? 'ソフト' : 'ハード'}
          </span>
          {constraintDefinition.softFlag &&
            constraintDefinition.penaltyWeight !== null &&
            constraintDefinition.penaltyWeight !== undefined && (
              <span className={styles.penaltyWeight}>
                重み: {constraintDefinition.penaltyWeight}
              </span>
            )}
        </div>
        {parameterDisplay && (
          <p className={styles.parameterInfo}>{parameterDisplay}</p>
        )}
      </div>
      <div className={styles.actions}>
        <form action={onEdit} className={styles.editForm}>
          <input type="hidden" name="id" value={constraintDefinition.id} />
          <button type="submit" className={styles.editButton}>
            編集
          </button>
        </form>
      </div>
    </div>
  )
}
