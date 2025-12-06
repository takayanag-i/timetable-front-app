import * as Slider from '@radix-ui/react-slider'
import type { ConstraintDefinition } from '@/core/domain/entity'
import styles from '../ConstraintDefinitionModal.module.css'

interface PenaltyWeightSliderProps {
  value: string
  onChange: (value: string) => void
  existingSoftConstraints: ConstraintDefinition[]
  disabled?: boolean
}

/**
 * ペナルティ重みスライダーコンポーネント
 */
export function PenaltyWeightSlider({
  value,
  onChange,
  existingSoftConstraints,
  disabled = false,
}: PenaltyWeightSliderProps) {
  const numericValue = value ? parseFloat(value) : 0.5

  return (
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
          value={[numericValue]}
          onValueChange={(values: number[]) => onChange(values[0].toString())}
          disabled={disabled}
        >
          <Slider.Track className={styles.sliderTrack}>
            <Slider.Range className={styles.sliderRange} />
          </Slider.Track>
          <Slider.Thumb className={styles.sliderThumb} />
        </Slider.Root>
        <div className={styles.sliderValue}>{value || '0.5'}</div>
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
  )
}
