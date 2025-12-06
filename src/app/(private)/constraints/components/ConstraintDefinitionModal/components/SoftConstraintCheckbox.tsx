import styles from '../ConstraintDefinitionModal.module.css'

interface SoftConstraintCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * ソフト制約チェックボックスコンポーネント
 */
export function SoftConstraintCheckbox({
  checked,
  onChange,
  disabled = false,
}: SoftConstraintCheckboxProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span>ソフト制約</span>
      </label>
      <span className={styles.helpText}>
        チェックを入れるとソフト制約、外すとハード制約になります
      </span>
    </div>
  )
}
