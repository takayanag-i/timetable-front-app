import type { ConstraintParameterMasterResponse } from '@/app/(private)/constraints/graphql/types'
import styles from '../ConstraintDefinitionModal.module.css'

interface ParametersFieldProps {
  selectedParameterMasters: ConstraintParameterMasterResponse[]
  parametersValue: string
  onChange: (value: string) => void
  disabled?: boolean
}

/**
 * パラメータフィールドコンポーネント
 */
export function ParametersField({
  selectedParameterMasters,
  parametersValue,
  onChange,
  disabled = false,
}: ParametersFieldProps) {
  if (selectedParameterMasters.length === 0) {
    return null
  }

  const handleParameterChange = (
    paramKey: string,
    value: string,
    isArray: boolean
  ) => {
    try {
      const params = parametersValue ? JSON.parse(parametersValue) : {}
      if (isArray) {
        params[paramKey] = value
          .split(',')
          .map(v => v.trim())
          .filter(v => v)
      } else {
        params[paramKey] = value
      }
      onChange(JSON.stringify(params))
    } catch (error) {
      console.error('Failed to parse parameters JSON:', error)
    }
  }

  const getParameterValue = (paramKey: string, isArray: boolean): string => {
    try {
      const params = parametersValue ? JSON.parse(parametersValue) : {}
      if (isArray) {
        return Array.isArray(params[paramKey])
          ? params[paramKey].join(', ')
          : ''
      } else {
        return params[paramKey]?.toString() || ''
      }
    } catch (error) {
      console.error('Failed to parse parameters JSON:', error)
      return ''
    }
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>パラメータ</label>
      {selectedParameterMasters.map(paramMaster => {
        const paramKey = paramMaster.parameterKey
        const paramName = paramMaster.parameterName
        const isArray = paramMaster.arrayFlag
        const optionList = paramMaster.optionList as string[] | undefined
        const currentValue = getParameterValue(paramKey, isArray)

        return (
          <div key={paramKey} className={styles.parameterField}>
            <label
              htmlFor={`param-${paramKey}`}
              className={styles.parameterLabel}
            >
              {paramName}
              {isArray && <span className={styles.arrayBadge}>配列</span>}
            </label>
            {optionList && optionList.length > 0 ? (
              <select
                id={`param-${paramKey}`}
                value={currentValue}
                onChange={e =>
                  handleParameterChange(paramKey, e.target.value, isArray)
                }
                className={styles.select}
                multiple={isArray}
                disabled={disabled}
              >
                {optionList.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`param-${paramKey}`}
                type="text"
                value={currentValue}
                onChange={e =>
                  handleParameterChange(paramKey, e.target.value, isArray)
                }
                className={styles.select}
                placeholder={
                  isArray
                    ? 'カンマ区切りで入力（例: value1, value2）'
                    : '値を入力'
                }
                disabled={disabled}
              />
            )}
          </div>
        )
      })}
      <span className={styles.helpText}>
        パラメータは自動的にJSON形式に変換されます
      </span>
    </div>
  )
}
