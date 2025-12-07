'use client'
import { ReactNode } from 'react'
import styles from './Modal.module.css'

/**
 * Modal コンポーネントのProps
 */
interface ModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean
  /** モーダルを閉じる際のコールバック */
  onClose: () => void
  /** モーダルの内容 */
  children: ReactNode
}

/**
 * 汎用モーダル
 */
export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
