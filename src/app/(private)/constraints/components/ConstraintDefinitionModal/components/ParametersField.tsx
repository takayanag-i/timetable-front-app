import { useMemo } from 'react'
import type { ConstraintParameterMasterResponse } from '@/app/(private)/constraints/graphql/types'
import { DAY_OF_WEEK_OPTIONS } from '@/constants'
import styles from '../ConstraintDefinitionModal.module.css'
import { CourseSelectField } from './CourseSelectField'
import { RadioButtonField } from './RadioButtonField'

interface ParametersFieldProps {
  constraintDefinitionCode: string
  selectedParameterMasters: ConstraintParameterMasterResponse[]
  parametersValue: string
  onChange: (value: string) => void
  disabled?: boolean
  maxPeriodsPerDay: number
}

/**
 * パラメータフィールドコンポーネント
 */
export function ParametersField({
  constraintDefinitionCode,
  selectedParameterMasters,
  parametersValue,
  onChange,
  disabled = false,
  maxPeriodsPerDay,
}: ParametersFieldProps) {
  /**
   * 同日開講数（教員）の選択肢
   * 1日あたりの最大時限数（1〜maxPeriodsPerDay）
   */
  const maxPeriodsOptions = useMemo(() => {
    return Array.from({ length: maxPeriodsPerDay }, (_, i) => ({
      value: String(i + 1),
      label: `${i + 1}時限`,
    }))
  }, [maxPeriodsPerDay])

  /**
   * 連続時限（教員）の選択肢
   * 連続して担当できる最大時限数（2〜maxPeriodsPerDay）
   */
  const maxConsecutivePeriodsOptions = useMemo(() => {
    // 最小は2、最大はmaxPeriodsPerDay
    const minValue = 2
    const maxValue = Math.max(minValue, maxPeriodsPerDay)
    return Array.from({ length: maxValue - minValue + 1 }, (_, i) => ({
      value: String(minValue + i),
      label: `${minValue + i}時限`,
    }))
  }, [maxPeriodsPerDay])

  /**
   * 時限の選択肢（1〜maxPeriodsPerDay）
   */
  const periodOptions = useMemo(() => {
    return Array.from({ length: maxPeriodsPerDay }, (_, i) => ({
      value: String(i + 1),
      label: `${i + 1}時限`,
    }))
  }, [maxPeriodsPerDay])

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

  /**
   * 制約定義コードとパラメータキーに応じたカスタム入力コンポーネントを返す
   */
  const renderCustomInput = (
    paramKey: string,
    currentValue: string
  ): React.ReactNode | null => {
    switch (constraintDefinitionCode) {
      case 'CONSECUTIVE_PERIOD':
        switch (paramKey) {
          case 'courseId':
            return (
              <CourseSelectField
                value={currentValue}
                onChange={value =>
                  handleParameterChange(paramKey, value, false)
                }
                disabled={disabled}
              />
            )
          default:
            return null
        }
      case 'INSTCUTOR_COURSES_PER_DAY':
        switch (paramKey) {
          case 'max_periods':
            return (
              <RadioButtonField
                name="max_periods"
                value={currentValue}
                options={maxPeriodsOptions}
                onChange={value =>
                  handleParameterChange(paramKey, value, false)
                }
                disabled={disabled}
              />
            )
          default:
            return null
        }
      case 'INSTRUCTOR_CONSECUTIVE_PERIOD':
        switch (paramKey) {
          case 'max_consecutive_periods':
            return (
              <RadioButtonField
                name="max_consecutive_periods"
                value={currentValue}
                options={maxConsecutivePeriodsOptions}
                onChange={value =>
                  handleParameterChange(paramKey, value, false)
                }
                disabled={disabled}
              />
            )
          default:
            return null
        }
      case 'SPECIFIC_DAY_PERIOD':
        switch (paramKey) {
          case 'courseId':
            return (
              <CourseSelectField
                value={currentValue}
                onChange={value =>
                  handleParameterChange(paramKey, value, false)
                }
                disabled={disabled}
              />
            )
          case 'dayOfWeek':
            return (
              <RadioButtonField
                name="dayOfWeek"
                value={currentValue}
                options={[...DAY_OF_WEEK_OPTIONS]}
                onChange={value =>
                  handleParameterChange(paramKey, value, false)
                }
                disabled={disabled}
              />
            )
          case 'period':
            return (
              <RadioButtonField
                name="period"
                value={currentValue}
                options={periodOptions}
                onChange={value =>
                  handleParameterChange(paramKey, value, false)
                }
                disabled={disabled}
              />
            )
          default:
            return null
        }
      default:
        return null
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

        // カスタム入力コンポーネントがある場合はそれを使用
        const customInput = renderCustomInput(paramKey, currentValue)
        if (customInput) {
          return (
            <div key={paramKey} className={styles.parameterField}>
              <label
                htmlFor={`param-${paramKey}`}
                className={styles.parameterLabel}
              >
                {paramName}
              </label>
              {customInput}
            </div>
          )
        }

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
    </div>
  )
}
