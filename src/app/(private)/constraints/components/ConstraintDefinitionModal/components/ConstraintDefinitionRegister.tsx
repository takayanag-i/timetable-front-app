'use client'

import { useState, useActionState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import * as Slider from '@radix-ui/react-slider'
import styles from '../ConstraintDefinitionModal.module.css'
import { createConstraintDefinition } from '../actions'
import type { ConstraintDefinitionMasterResponse } from '@/types/graphql-types'
import type { ConstraintDefinitionFormValues } from '@/lib/constraint-definition-types'
import type { ConstraintDefinition } from '@/core/domain/entity'

interface ConstraintDefinitionRegisterProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  constraintDefinitionMasters: ConstraintDefinitionMasterResponse[]
  existingConstraintDefinitions?: ConstraintDefinition[]
  initialValues: ConstraintDefinitionFormValues
}

/**
 * 制約定義登録コンポーネント（新規作成用）
 */
export function ConstraintDefinitionRegister({
  isOpen,
  onClose,
  onSuccess,
  constraintDefinitionMasters,
  existingConstraintDefinitions = [],
  initialValues,
}: ConstraintDefinitionRegisterProps) {
  const [error, setError] = useState<string | null>(null)

  const {
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ConstraintDefinitionFormValues>({
    defaultValues: initialValues,
    mode: 'onChange',
  })

  const constraintDefinitionCodeValue = watch('constraintDefinitionCode')
  const softFlagValue = watch('softFlag')
  const penaltyWeightValue = watch('penaltyWeight')
  const parametersValue = watch('parameters')

  // 選択された制約定義コードに対応するパラメータマスタを取得
  const selectedParameterMasters =
    constraintDefinitionMasters.find(
      m => m.constraintDefinitionCode === constraintDefinitionCodeValue
    )?.parameterMasters || []

  // 既存のソフト制約を取得（同じ制約定義コードで、ソフト制約のもの）
  const existingSoftConstraints = existingConstraintDefinitions.filter(
    cd =>
      cd.constraintDefinitionCode === constraintDefinitionCodeValue &&
      cd.softFlag === true
  )

  const [createResult, createAction, isCreating] = useActionState(
    createConstraintDefinition,
    null
  )

  const isPending = isCreating

  const resetFormState = useCallback(() => {
    reset(initialValues)
    setError(null)
  }, [reset, initialValues])

  const handleClose = useCallback(() => {
    resetFormState()
    onClose()
  }, [resetFormState, onClose])

  const onSuccessRef = useRef(onSuccess)
  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    if (isOpen) {
      resetFormState()
    }
  }, [isOpen, resetFormState])

  useEffect(() => {
    if (createResult && !createResult.success) {
      setError(createResult.error)
    }
  }, [createResult])

  const prevCreateSuccessRef = useRef(false)
  useEffect(() => {
    const createSuccess = Boolean(createResult?.success)
    if (createSuccess && !prevCreateSuccessRef.current) {
      resetFormState()
      onSuccessRef.current?.()
    }
    prevCreateSuccessRef.current = createSuccess
  }, [createResult?.success, resetFormState])

  const isFormValid =
    !!constraintDefinitionCodeValue &&
    (softFlagValue ? !!penaltyWeightValue || penaltyWeightValue === '' : true)

  return (
    <>
      {error && <div className={styles.error}>{error}</div>}

      <form action={createAction} className={styles.form}>
        <input
          type="hidden"
          name="constraintDefinitionCode"
          value={constraintDefinitionCodeValue}
        />
        <input type="hidden" name="softFlag" value={softFlagValue.toString()} />
        <input type="hidden" name="penaltyWeight" value={penaltyWeightValue} />
        <input type="hidden" name="parameters" value={parametersValue} />

        {/* 制約フィールド */}
        <div className={styles.field}>
          <label htmlFor="constraintDefinitionCode" className={styles.label}>
            制約 <span className={styles.required}>*</span>
          </label>
          <select
            id="constraintDefinitionCode"
            value={constraintDefinitionCodeValue}
            onChange={e => {
              setValue('constraintDefinitionCode', e.target.value)
              // 選択された制約定義コードに応じてsoftFlagを設定
              const selectedMaster = constraintDefinitionMasters.find(
                m => m.constraintDefinitionCode === e.target.value
              )
              if (selectedMaster) {
                setValue('softFlag', selectedMaster.softFlag)
              }
            }}
            className={styles.select}
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
          {errors.constraintDefinitionCode && (
            <span className={styles.fieldError}>
              {errors.constraintDefinitionCode.message}
            </span>
          )}
        </div>

        {/* ソフト制約フィールド */}
        <div className={styles.field}>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={softFlagValue}
              onChange={e => setValue('softFlag', e.target.checked)}
            />
            <span>ソフト制約</span>
          </label>
          <span className={styles.helpText}>
            チェックを入れるとソフト制約、外すとハード制約になります
          </span>
        </div>

        {/* 重みフィールド */}
        {softFlagValue && (
          <div className={styles.field}>
            <label htmlFor="penaltyWeight" className={styles.label}>
              重み
            </label>
            <div className={styles.sliderContainer}>
              <Slider.Root
                className={styles.slider}
                min={0}
                max={1}
                step={0.01}
                value={[
                  penaltyWeightValue ? parseFloat(penaltyWeightValue) : 0.5,
                ]}
                onValueChange={(value: number[]) =>
                  setValue('penaltyWeight', value[0].toString())
                }
              >
                <Slider.Track className={styles.sliderTrack}>
                  <Slider.Range className={styles.sliderRange} />
                </Slider.Track>
                <Slider.Thumb className={styles.sliderThumb} />
              </Slider.Root>
              <div className={styles.sliderValue}>
                {penaltyWeightValue || '0.5'}
              </div>
            </div>
            {existingSoftConstraints.length > 0 && (
              <div className={styles.existingConstraints}>
                <span className={styles.helpText}>既存のソフト制約:</span>
                {existingSoftConstraints.map(constraint => (
                  <div key={constraint.id} className={styles.existingConstraint}>
                    <span className={styles.existingConstraintLabel}>
                      重み: {constraint.penaltyWeight?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <span className={styles.helpText}>
              ソフト制約の場合のみ有効です（0.00 ~ 1.00）
            </span>
          </div>
        )}

        {/* パラメータフィールド（動的生成） */}
        {selectedParameterMasters.length > 0 && (
          <div className={styles.field}>
            <label className={styles.label}>パラメータ</label>
            {selectedParameterMasters.map(paramMaster => {
              const paramKey = paramMaster.parameterKey
              const paramName = paramMaster.parameterName
              const isArray = paramMaster.arrayFlag
              const optionList = paramMaster.optionList as
                | string[]
                | undefined

              // 現在のパラメータ値を取得
              let currentValue: string = ''
              try {
                const params = parametersValue
                  ? JSON.parse(parametersValue)
                  : {}
                if (isArray) {
                  currentValue = Array.isArray(params[paramKey])
                    ? params[paramKey].join(', ')
                    : ''
                } else {
                  currentValue = params[paramKey]?.toString() || ''
                }
              } catch {
                // JSONパースエラー時は空文字
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
                      onChange={e => {
                        try {
                          const params = parametersValue
                            ? JSON.parse(parametersValue)
                            : {}
                          if (isArray) {
                            params[paramKey] = e.target.value
                              .split(',')
                              .map(v => v.trim())
                              .filter(v => v)
                          } else {
                            params[paramKey] = e.target.value
                          }
                          setValue('parameters', JSON.stringify(params))
                        } catch {
                          // エラー時は何もしない
                        }
                      }}
                      className={styles.select}
                      multiple={isArray}
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
                      onChange={e => {
                        try {
                          const params = parametersValue
                            ? JSON.parse(parametersValue)
                            : {}
                          if (isArray) {
                            params[paramKey] = e.target.value
                              .split(',')
                              .map(v => v.trim())
                              .filter(v => v)
                          } else {
                            params[paramKey] = e.target.value
                          }
                          setValue('parameters', JSON.stringify(params))
                        } catch {
                          // エラー時は何もしない
                        }
                      }}
                      className={styles.select}
                      placeholder={
                        isArray
                          ? 'カンマ区切りで入力（例: value1, value2）'
                          : '値を入力'
                      }
                    />
                  )}
                </div>
              )
            })}
            <span className={styles.helpText}>
              パラメータは自動的にJSON形式に変換されます
            </span>
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleClose}
            disabled={isPending}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isPending || !isFormValid}
          >
            {isPending ? '作成中...' : '作成'}
          </button>
        </div>
      </form>
    </>
  )
}
