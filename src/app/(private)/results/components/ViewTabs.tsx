import Link from 'next/link'
import styles from './ViewTabs.module.css'

type ViewType = 'homeroom' | 'homeroom-list' | 'teacher' | 'teacher-list'

interface ViewTabsProps {
  activeView: ViewType
  resultId: string
}

const VIEW_TABS: Array<{ view: ViewType; label: string }> = [
  { view: 'homeroom', label: '学級' },
  { view: 'homeroom-list', label: '学級一覧' },
  { view: 'teacher', label: '教員' },
  { view: 'teacher-list', label: '教員一覧' },
]

/**
 * ビュー切り替えタブコンポーネント（Server Component）
 */
export default function ViewTabs({ activeView, resultId }: ViewTabsProps) {
  return (
    <div className={styles.tabContainer}>
      {VIEW_TABS.map(({ view, label }) => (
        <Link
          key={view}
          href={`/results/${resultId}?view=${view}`}
          className={`${styles.tab} ${activeView === view ? styles.active : ''}`}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
