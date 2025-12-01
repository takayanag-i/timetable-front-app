'use client'

import styles from './ViewTabs.module.css'

interface ViewTabsProps {
  activeView: 'homeroom' | 'teacher'
  onViewChange: (view: 'homeroom' | 'teacher') => void
}

/**
 * ビュー切り替えタブコンポーネント
 */
export default function ViewTabs({ activeView, onViewChange }: ViewTabsProps) {
  return (
    <div className={styles.tabContainer}>
      <button
        className={`${styles.tab} ${activeView === 'homeroom' ? styles.active : ''}`}
        onClick={() => onViewChange('homeroom')}
      >
        学級ビュー
      </button>
      <button
        className={`${styles.tab} ${activeView === 'teacher' ? styles.active : ''}`}
        onClick={() => onViewChange('teacher')}
      >
        教員ビュー
      </button>
    </div>
  )
}
