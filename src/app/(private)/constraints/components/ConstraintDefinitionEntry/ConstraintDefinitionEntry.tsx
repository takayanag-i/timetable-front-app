import { ConstraintDefinition } from '@/core/domain/entity'
import styles from './ConstraintDefinitionEntry.module.css'

/**
 * ConstraintDefinitionEntry コンポーネントのProps
 */
interface ConstraintDefinitionEntryProps {
  constraintDefinition: ConstraintDefinition
  /** Server Actionを受け取る */
  onEdit?: (formData: FormData) => void
}

/**
 * 制約定義エントリコンポーネント
 */
export default function ConstraintDefinitionEntry({
  constraintDefinition,
  onEdit,
}: ConstraintDefinitionEntryProps) {
  return (
    <div className={styles.entry}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.code}>
            {constraintDefinition.constraintDefinitionCode}
          </h3>
          <span
            className={`${styles.flag} ${
              constraintDefinition.softFlag ? styles.soft : styles.hard
            }`}
          >
            {constraintDefinition.softFlag ? 'ソフト' : 'ハード'}
          </span>
        </div>
        {constraintDefinition.penaltyWeight !== null &&
          constraintDefinition.penaltyWeight !== undefined && (
            <div className={styles.penaltyWeight}>
              重み: {constraintDefinition.penaltyWeight}
            </div>
          )}
        {constraintDefinition.parameters != null && (
          <div className={styles.parameters}>
            パラメータ:{' '}
            {(() => {
              const params = constraintDefinition.parameters
              let paramStr: string
              if (typeof params === 'string') {
                paramStr = params
              } else {
                try {
                  paramStr = JSON.stringify(params, null, 2)
                } catch {
                  paramStr = String(params)
                }
              }
              return paramStr
            })()}
          </div>
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
