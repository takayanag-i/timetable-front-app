'use client'
import styles from './OpenModalButton.module.css'

interface OpenModalButtonProps {
  label?: string
  onClick?: () => void
}

export default function OpenModalButton({
  label = '学級を追加する',
  onClick,
}: OpenModalButtonProps) {
  return (
    <button className={styles.openModalButton} onClick={onClick}>
      {label}
    </button>
  )
}
