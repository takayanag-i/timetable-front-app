import styles from '../ConstraintDefinitionModal.module.css'

interface RadioOption {
  value: string
  label: string
}

interface RadioButtonFieldProps {
  name: string
  value: string
  options: RadioOption[]
  onChange: (value: string) => void
  disabled?: boolean
}

/**
 * ラジオボタンフィールド
 */
export function RadioButtonField({
  name,
  value,
  options,
  onChange,
  disabled = false,
}: RadioButtonFieldProps) {
  return (
    <div className={styles.radioGroup}>
      {options.map(option => (
        <label key={option.value} className={styles.radioLabel}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            className={styles.radioInput}
          />
          <span className={styles.radioText}>{option.label}</span>
        </label>
      ))}
    </div>
  )
}
