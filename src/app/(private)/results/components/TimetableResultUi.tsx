import type { TimetableResultType } from '@/app/(private)/results/graphql/types'
import styles from './TimetableResultUi.module.css'
import ViewTabs from './ViewTabs'
import HomeroomView from './HomeroomView'
import HomeroomListView from './HomeroomListView'
import TeacherView from './TeacherView'
import TeacherListView from './TeacherListView'

type ViewType = 'homeroom' | 'homeroom-list' | 'teacher' | 'teacher-list'

interface TimetableResultUiProps {
  timetableResult: TimetableResultType
  activeView: ViewType
}

/**
 * アクティブビューに応じたコンポーネントをレンダリングする
 *
 * @param activeView - アクティブなビュータイプ
 * @param timetableResult - 時間割結果
 * @returns ビューコンポーネント
 */
function renderView(
  activeView: ViewType,
  timetableResult: TimetableResultType
) {
  switch (activeView) {
    case 'homeroom':
      return <HomeroomView timetableResult={timetableResult} />
    case 'homeroom-list':
      return <HomeroomListView timetableResult={timetableResult} />
    case 'teacher':
      return <TeacherView timetableResult={timetableResult} />
    case 'teacher-list':
      return <TeacherListView timetableResult={timetableResult} />
  }
}

/**
 * 時間割結果表示画面（Server Component）
 */
export default function TimetableResultUi({
  timetableResult,
  activeView,
}: TimetableResultUiProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>時間割編成結果</h1>
      </header>

      {/* 制約違反の表示 */}
      {timetableResult.constraintViolations.length > 0 && (
        <div className={styles.violationsSection}>
          <h2 className={styles.sectionTitle}>制約違反</h2>
          <ul className={styles.violationsList}>
            {timetableResult.constraintViolations.map(violation => (
              <li key={violation.id} className={styles.violationItem}>
                <span className={styles.violationCode}>
                  {violation.constraintViolationCode}
                </span>
                <span className={styles.violationKeys}>
                  {JSON.stringify(violation.violatingKeys)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ビュー切り替えタブ */}
      <ViewTabs activeView={activeView} resultId={timetableResult.id} />

      {/* 時間割表の表示 */}
      {renderView(activeView, timetableResult)}
    </div>
  )
}
