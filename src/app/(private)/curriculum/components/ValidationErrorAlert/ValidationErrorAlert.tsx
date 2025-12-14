import type { HomeroomValidationResult } from '../../utils/validation'
import styles from './ValidationErrorAlert.module.css'

/**
 * ValidationErrorAlert コンポーネントのProps
 */
interface ValidationErrorAlertProps {
  /** バリデーションエラーの配列 */
  errors: HomeroomValidationResult[]
  /** 閉じるボタンクリック時のハンドラー */
  onClose: () => void
}

/**
 * 単位数不足のバリデーションエラーを表示するアラートコンポーネント
 */
export default function ValidationErrorAlert({
  errors,
  onClose,
}: ValidationErrorAlertProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <div role="alert" className={styles.alert}>
      <div className={styles.header}>
        <h3 className={styles.title}>⚠️ 単位数が不足しています</h3>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label="閉じる"
        >
          ×
        </button>
      </div>
      <p className={styles.message}>
        以下の学級でコースの単位数合計がコマ数より少ないため、最適化を実行できません。
      </p>
      <ul className={styles.errorList}>
        {errors.map(error => (
          <li key={error.homeroomId}>
            <strong>{error.homeroomName}</strong>: 単位数合計{' '}
            {error.totalCredits} / コマ数 {error.totalPeriods}（
            {error.totalPeriods - error.totalCredits} 不足）
          </li>
        ))}
      </ul>
    </div>
  )
}

