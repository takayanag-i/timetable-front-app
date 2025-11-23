import { forwardRef } from 'react'
import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
} from 'react'
import styles from './Input.module.css'

export interface InputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'onChange'
  > {
  /** ラベルテキスト */
  label: string
  /** 値変更時のコールバック（ネイティブイベント） */
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  /** フォーカス時のコールバック */
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void
  /** フォーカスが外れた際のコールバック */
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  /** キー押下時のコールバック */
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  /** ブラウザ自動補完の制御 */
  autoComplete?: string
  /** 追加のクラス */
  className?: string
  /** 文字列の変更を直接受け取る場合に使用 */
  onValueChange?: (value: string) => void
}

/**
 * ラベル付き入力コンポーネント
 *
 * @param props.value - 入力値
 * @param props.onChange - 値変更時のコールバック
 * @param props.label - ラベルテキスト
 * @param props.placeholder - プレースホルダーテキスト
 * @param props.id - input要素のID
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id = 'input', className, onValueChange, onChange, ...rest },
  ref
) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange?.(event.target.value)
    onChange?.(event)
  }

  const inputClassName = className
    ? `${styles.input} ${className}`
    : styles.input

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={inputClassName}
        onChange={handleChange}
        {...rest}
      />
    </div>
  )
})

export default Input
