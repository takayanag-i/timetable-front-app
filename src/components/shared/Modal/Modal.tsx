'use client'
import { ReactNode } from 'react'
import styles from './Modal.module.css'

/**
 * Props
 */
interface Props {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * 汎用モーダル
 */
export default function Modal({ isOpen, onClose, children }: Props) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
