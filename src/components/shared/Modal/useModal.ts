import { useState, useCallback } from 'react'

/**
 * モーダルの状態を管理するカスタムフック
 *
 * @param initialIsOpen - 初期状態（デフォルト: false）
 * @returns モーダルの状態と操作関数
 * @version 0.1.0
 */
export function useModal(initialIsOpen: boolean = false) {
  // モーダルの開閉状態
  const [isOpen, setIsOpen] = useState(initialIsOpen)

  /**
   * モーダルを開く
   */
  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  /**
   * モーダルを閉じる
   */
  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  /**
   * モーダルの開閉状態を切り替え
   */
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return {
    // 状態
    isOpen,
    // 操作関数
    open,
    close,
    toggle,
  }
}
