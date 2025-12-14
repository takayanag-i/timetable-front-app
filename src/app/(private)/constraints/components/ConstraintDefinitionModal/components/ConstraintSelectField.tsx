import type { ConstraintDefinitionMasterResponse } from '@/app/(private)/constraints/graphql/types'
import styles from '../ConstraintDefinitionModal.module.css'

interface ConstraintSelectFieldProps {
  value: string
  onChange: (value: string) => void
  constraintDefinitionMasters: ConstraintDefinitionMasterResponse[]
  disabled?: boolean
  error?: string
  isEditMode?: boolean
}

/**
 * 制約選択フィールドコンポーネント
 */
export function ConstraintSelectField({
  value,
  onChange,
  constraintDefinitionMasters,
  disabled = false,
  error,
  isEditMode = false,
}: ConstraintSelectFieldProps) {
  const selectedMaster = constraintDefinitionMasters.find(
    m => m.constraintDefinitionCode === value
  )

  return (
    <div className={styles.field}>
      <label
        htmlFor={!isEditMode ? 'constraintDefinitionCode' : undefined}
        className={styles.label}
      >
        制約 {!isEditMode && <span className={styles.required}>*</span>}
      </label>
      {isEditMode ? (
        <>
          <input
            type="text"
            value={selectedMaster?.constraintDefinitionName || value}
            disabled
            className={styles.select}
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          />
          {selectedMaster?.description && (
            <span className={styles.helpText}>
              {selectedMaster.description}
            </span>
          )}
        </>
      ) : (
        <select
          id="constraintDefinitionCode"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={styles.select}
          disabled={disabled}
        >
          <option value="">選択してください</option>
          {constraintDefinitionMasters.map(master => (
            <option
              key={master.constraintDefinitionCode}
              value={master.constraintDefinitionCode}
            >
              {master.constraintDefinitionName}
            </option>
          ))}
        </select>
      )}
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  )
}
