'use client'

import styles from './ViewTabs.module.css'

interface ViewTabsProps {
  activeView: 'homeroom' | 'homeroom-list' | 'teacher' | 'teacher-list'
  onViewChange: (view: 'homeroom' | 'homeroom-list' | 'teacher' | 'teacher-list') => void
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
        className={`${styles.tab} ${activeView === 'homeroom-list' ? styles.active : ''}`}
        onClick={() => onViewChange('homeroom-list')}
      >
        学級一覧ビュー
      </button>
      <button
        className={`${styles.tab} ${activeView === 'teacher' ? styles.active : ''}`}
        onClick={() => onViewChange('teacher')}
      >
        教員ビュー
      </button>
      <button
        className={`${styles.tab} ${activeView === 'teacher-list' ? styles.active : ''}`}
        onClick={() => onViewChange('teacher-list')}
      >
        教員一覧ビュー
      </button>
    </div>
  )
}
